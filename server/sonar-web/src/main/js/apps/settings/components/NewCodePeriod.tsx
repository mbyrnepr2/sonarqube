/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { getNewCodePeriod, setNewCodePeriod } from '../../../api/newCodePeriod';
import DocLink from '../../../components/common/DocLink';
import { ResetButtonLink, SubmitButton } from '../../../components/controls/buttons';
import AlertSuccessIcon from '../../../components/icons/AlertSuccessIcon';
import NewCodeDefinitionDaysOption from '../../../components/new-code-definition/NewCodeDefinitionDaysOption';
import NewCodeDefinitionPreviousVersionOption from '../../../components/new-code-definition/NewCodeDefinitionPreviousVersionOption';
import NewCodeDefinitionWarning from '../../../components/new-code-definition/NewCodeDefinitionWarning';
import DeferredSpinner from '../../../components/ui/DeferredSpinner';
import { translate } from '../../../helpers/l10n';
import {
  getNumberOfDaysDefaultValue,
  isNewCodeDefinitionCompliant,
} from '../../../helpers/new-code-definition';
import { NewCodeDefinitionType } from '../../../types/new-code-definition';

interface State {
  currentSetting?: NewCodeDefinitionType;
  days: string;
  loading: boolean;
  currentSettingValue?: string;
  saving: boolean;
  selected?: NewCodeDefinitionType;
  success: boolean;
}

export default class NewCodePeriod extends React.PureComponent<{}, State> {
  mounted = false;
  state: State = {
    loading: true,
    days: getNumberOfDaysDefaultValue(),
    saving: false,
    success: false,
  };

  componentDidMount() {
    this.mounted = true;
    this.fetchNewCodePeriodSetting();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchNewCodePeriodSetting() {
    getNewCodePeriod()
      .then(({ type, value }) => {
        this.setState(({ days }) => ({
          currentSetting: type,
          days: type === NewCodeDefinitionType.NumberOfDays ? String(value) : days,
          loading: false,
          currentSettingValue: value,
          selected: type,
        }));
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  onSelectDays = (days: string) => {
    this.setState({ days, success: false });
  };

  onSelectSetting = (selected: NewCodeDefinitionType) => {
    this.setState({ selected, success: false });
  };

  onCancel = () => {
    this.setState(({ currentSetting, currentSettingValue, days }) => ({
      selected: currentSetting,
      days:
        currentSetting === NewCodeDefinitionType.NumberOfDays ? String(currentSettingValue) : days,
    }));
  };

  onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { days, selected } = this.state;

    const type = selected;
    const value = type === NewCodeDefinitionType.NumberOfDays ? days : undefined;

    this.setState({ saving: true, success: false });
    setNewCodePeriod({
      type: type as NewCodeDefinitionType,
      value,
    }).then(
      () => {
        if (this.mounted) {
          this.setState({
            saving: false,
            currentSetting: type,
            currentSettingValue: value || undefined,
            success: true,
          });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({
            saving: false,
          });
        }
      }
    );
  };

  render() {
    const { currentSetting, days, loading, currentSettingValue, saving, selected, success } =
      this.state;

    const isChanged =
      selected !== currentSetting ||
      (selected === NewCodeDefinitionType.NumberOfDays && String(days) !== currentSettingValue);

    const isValid =
      selected !== NewCodeDefinitionType.NumberOfDays ||
      isNewCodeDefinitionCompliant({ type: NewCodeDefinitionType.NumberOfDays, value: days });

    return (
      <>
        <h2
          className="settings-sub-category-name settings-definition-name"
          title={translate('settings.new_code_period.title')}
        >
          {translate('settings.new_code_period.title')}
        </h2>

        <ul className="settings-sub-categories-list">
          <li>
            <ul className="settings-definitions-list">
              <li>
                <div className="settings-definition">
                  <div className="settings-definition-left">
                    <div className="small">
                      <p className="sw-mb-2">
                        {translate('settings.new_code_period.description0')}
                      </p>
                      <p className="sw-mb-2">
                        {translate('settings.new_code_period.description1')}
                      </p>
                      <p className="sw-mb-2">
                        {translate('settings.new_code_period.description2')}
                      </p>

                      <p className="sw-mb-2">
                        <FormattedMessage
                          defaultMessage={translate('settings.new_code_period.description3')}
                          id="settings.new_code_period.description3"
                          values={{
                            link: (
                              <DocLink to="/project-administration/defining-new-code/">
                                {translate('settings.new_code_period.description3.link')}
                              </DocLink>
                            ),
                          }}
                        />
                      </p>

                      <p className="sw-mt-4">
                        <strong>{translate('settings.new_code_period.question')}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="settings-definition-right">
                    <DeferredSpinner loading={loading} timeout={500}>
                      <form onSubmit={this.onSubmit}>
                        <NewCodeDefinitionPreviousVersionOption
                          isDefault
                          onSelect={this.onSelectSetting}
                          selected={selected === NewCodeDefinitionType.PreviousVersion}
                        />
                        <NewCodeDefinitionDaysOption
                          className="spacer-top sw-mb-4"
                          days={days}
                          isChanged={isChanged}
                          isValid={isValid}
                          onChangeDays={this.onSelectDays}
                          onSelect={this.onSelectSetting}
                          selected={selected === NewCodeDefinitionType.NumberOfDays}
                        />
                        <NewCodeDefinitionWarning
                          newCodeDefinitionType={currentSetting}
                          newCodeDefinitionValue={currentSettingValue}
                          isBranchSupportEnabled={undefined}
                          level="global"
                        />
                        {isChanged && (
                          <div className="big-spacer-top">
                            <p className="spacer-bottom">
                              {translate('baseline.next_analysis_notice')}
                            </p>
                            <DeferredSpinner className="spacer-right" loading={saving} />
                            <SubmitButton disabled={saving || !isValid}>
                              {translate('save')}
                            </SubmitButton>
                            <ResetButtonLink className="spacer-left" onClick={this.onCancel}>
                              {translate('cancel')}
                            </ResetButtonLink>
                          </div>
                        )}
                        {!saving && !loading && success && (
                          <div className="big-spacer-top">
                            <span className="text-success">
                              <AlertSuccessIcon className="spacer-right" />
                              {translate('settings.state.saved')}
                            </span>
                          </div>
                        )}
                      </form>
                    </DeferredSpinner>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </>
    );
  }
}
