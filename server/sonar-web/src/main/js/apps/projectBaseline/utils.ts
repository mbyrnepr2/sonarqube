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
import { isNewCodeDefinitionCompliant } from '../../helpers/new-code-definition';
import { NewCodeDefinitionType } from '../../types/new-code-definition';

export function getSettingValue({
  analysis,
  days,
  referenceBranch,
  type,
}: {
  analysis?: string;
  days?: string;
  referenceBranch?: string;
  type?: NewCodeDefinitionType;
}) {
  switch (type) {
    case NewCodeDefinitionType.NumberOfDays:
      return days;
    case NewCodeDefinitionType.ReferenceBranch:
      return referenceBranch;
    case NewCodeDefinitionType.SpecificAnalysis:
      return analysis;
    default:
      return undefined;
  }
}

export function validateSetting(state: {
  analysis?: string;
  currentSetting?: NewCodeDefinitionType;
  currentSettingValue?: string;
  days: string;
  overrideGeneralSetting?: boolean;
  referenceBranch?: string;
  selected?: NewCodeDefinitionType;
}) {
  const {
    analysis = '',
    currentSetting,
    currentSettingValue,
    days,
    overrideGeneralSetting,
    referenceBranch = '',
    selected,
  } = state;

  let isChanged;
  if (!currentSetting && overrideGeneralSetting !== undefined) {
    isChanged = overrideGeneralSetting;
  } else {
    isChanged =
      overrideGeneralSetting === false ||
      selected !== currentSetting ||
      (selected === NewCodeDefinitionType.NumberOfDays && days !== currentSettingValue) ||
      (selected === NewCodeDefinitionType.SpecificAnalysis && analysis !== currentSettingValue) ||
      (selected === NewCodeDefinitionType.ReferenceBranch &&
        referenceBranch !== currentSettingValue);
  }

  const isValid =
    overrideGeneralSetting === false ||
    (!!selected &&
      isNewCodeDefinitionCompliant({
        type: selected,
        value: days,
      }) &&
      (selected !== NewCodeDefinitionType.SpecificAnalysis || analysis.length > 0) &&
      (selected !== NewCodeDefinitionType.ReferenceBranch || referenceBranch.length > 0));

  return { isChanged, isValid };
}
