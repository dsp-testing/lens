/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogSyncToRendererInjectable from "./catalog-sync-to-renderer.injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../start-main-application/runnable-tokens/phases";

const stopCatalogSyncInjectable = getInjectable({
  id: "stop-catalog-sync",

  instantiate: (di) => ({
    run: () => {
      const catalogSyncToRenderer = di.inject(catalogSyncToRendererInjectable);

      if (catalogSyncToRenderer.started) {
        catalogSyncToRenderer.stop();
      }

      return undefined;
    },
  }),

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default stopCatalogSyncInjectable;
