/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import extensionDiscoveryInjectable from "../../../extensions/extension-discovery/extension-discovery.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import type { LensExtensionId } from "@k8slens/legacy-extensions";
import { extensionDisplayName } from "../../../extensions/lens-extension";
import React from "react";
import { when } from "mobx";
import { getMessageFromError } from "./get-message-from-error/get-message-from-error";
import showSuccessNotificationInjectable from "../notifications/show-success-notification.injectable";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";

const uninstallExtensionInjectable = getInjectable({
  id: "uninstall-extension",

  instantiate: (di) => {
    const extensionLoader = di.inject(extensionLoaderInjectable);
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);
    const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);
    const logger = di.inject(loggerInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);

    return async (extensionId: LensExtensionId): Promise<boolean> => {
      const ext = extensionLoader.getExtension(extensionId);

      if (!ext) {
        logger.debug(`[EXTENSIONS]: cannot uninstall ${extensionId}, was not installed`);

        return true;
      }

      const { manifest } = ext;
      const displayName = extensionDisplayName(manifest.name, manifest.version);

      try {
        logger.debug(`[EXTENSIONS]: trying to uninstall ${extensionId}`);
        extensionInstallationStateStore.setUninstalling(extensionId);

        await extensionDiscovery.uninstallExtension(extensionId);

        // wait for the ExtensionLoader to actually uninstall the extension
        await when(() => !extensionLoader.userExtensions.has(extensionId));

        showSuccessNotification(
          <p>
            {"Extension "}
            <b>{displayName}</b>
            {" successfully uninstalled!"}
          </p>,
        );

        return true;
      } catch (error) {
        const message = getMessageFromError(error);

        logger.info(
          `[EXTENSION-UNINSTALL]: uninstalling ${displayName} has failed: ${error}`,
          { error },
        );
        showErrorNotification(
          <p>
            {"Uninstalling extension "}
            <b>{displayName}</b>
            {" has failed: "}
            <em>{message}</em>
          </p>,
        );

        return false;
      } finally {
      // Remove uninstall state on uninstall failure
        extensionInstallationStateStore.clearUninstalling(extensionId);
      }
    };
  },
});

export default uninstallExtensionInjectable;
