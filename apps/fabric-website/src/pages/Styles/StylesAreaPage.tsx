import * as React from 'react';
import { getSubTitle } from '../../utilities/index';
import { IPageProps, Page } from '@uifabric/example-app-base/lib/index2';
import { Platforms } from '../../interfaces/Platforms';
import { withPlatform } from '@uifabric/example-app-base/lib/utilities/PlatformContext';

export interface IStylesPageProps extends IPageProps<Platforms> {}

export const StylesPageBase: React.StatelessComponent<IStylesPageProps> = props => {
  const { platform } = props;
  return <Page {...props} platform={platform} subTitle={getSubTitle(platform)} />;
};

export const StylesAreaPage: React.StatelessComponent<IStylesPageProps> = withPlatform<Platforms>(StylesPageBase);
