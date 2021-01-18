import { CxEvent } from '@spartacus/core';
import { TmsModule } from '@spartacus/tms';
import { FeatureEnvironment } from '../models/feature.model';

export const tmsFeature: FeatureEnvironment = {
  imports: [
    TmsModule.forRoot({
      tms: {
        gtm: {
          events: [CxEvent],
        },
        adobeLaunch: {
          events: [CxEvent],
        },
      },
    }),
  ],
};