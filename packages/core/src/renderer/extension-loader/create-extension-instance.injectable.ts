/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Writable } from "type-fest";
import catalogCategoryRegistryInjectable from "../../common/catalog/category-registry.injectable";
import loggerInjectable from "../../common/logger.injectable";
import { createExtensionInstanceInjectionToken } from "../../extensions/extension-loader/create-extension-instance.token";
import ensureHashedDirectoryForExtensionInjectable from "../../extensions/extension-loader/file-system-provisioner-store/ensure-hashed-directory-for-extension.injectable";
import { lensExtensionDependencies } from "../../extensions/lens-extension";
import type { LensRendererExtensionDependencies } from "../../extensions/lens-extension-set-dependencies";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import catalogEntityRegistryInjectable from "../api/catalog/entity/registry.injectable";
import getExtensionPageParametersInjectable from "../routes/get-extension-page-parameters.injectable";
import navigateToRouteInjectable from "../routes/navigate-to-route.injectable";
import routesInjectable from "../routes/routes.injectable";

const createExtensionInstanceInjectable = getInjectable({
  id: "create-extension-instance",
  instantiate: (di) => {
    const deps: LensRendererExtensionDependencies = {
      categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
      entityRegistry: di.inject(catalogEntityRegistryInjectable),
      ensureHashedDirectoryForExtension: di.inject(ensureHashedDirectoryForExtensionInjectable),
      getExtensionPageParameters: di.inject(getExtensionPageParametersInjectable),
      navigateToRoute: di.inject(navigateToRouteInjectable),
      routes: di.inject(routesInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (ExtensionClass, extension) => {
      const instance = new ExtensionClass(extension) as LensRendererExtension;

      (instance as Writable<LensRendererExtension>)[lensExtensionDependencies] = deps;

      return instance;
    };
  },
  injectionToken: createExtensionInstanceInjectionToken,
});

export default createExtensionInstanceInjectable;
