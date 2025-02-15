/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { iter } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { comparer, action } from "mobx";
import { clusterStoreMigrationInjectionToken } from "./migration-token";
import readClusterConfigSyncInjectable from "./read-cluster-config.injectable";
import type { ClusterId, ClusterModel } from "../../../../common/cluster-types";
import { Cluster } from "../../../../common/cluster/cluster";
import loggerInjectable from "../../../../common/logger.injectable";
import createPersistentStorageInjectable from "../../../../common/persistent-storage/create.injectable";
import persistentStorageMigrationsInjectable from "../../../../common/persistent-storage/migrations.injectable";
import storeMigrationVersionInjectable from "../../../../common/vars/store-migration-version.injectable";
import clustersStateInjectable from "./state.injectable";

export interface ClusterStoreModel {
  clusters?: ClusterModel[];
}

const clustersPersistentStorageInjectable = getInjectable({
  id: "clusters-persistent-storage",
  instantiate: (di) => {
    const createPersistentStorage = di.inject(createPersistentStorageInjectable);
    const readClusterConfigSync = di.inject(readClusterConfigSyncInjectable);
    const clustersState = di.inject(clustersStateInjectable);
    const logger = di.inject(loggerInjectable);

    return createPersistentStorage<ClusterStoreModel>({
      configName: "lens-cluster-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      projectVersion: di.inject(storeMigrationVersionInjectable),
      migrations: di.inject(persistentStorageMigrationsInjectable, clusterStoreMigrationInjectionToken),
      fromStore: action(({ clusters = [] }) => {
        const currentClusters = new Map(clustersState);
        const newClusters = new Map<ClusterId, Cluster>();

        // update new clusters
        for (const clusterModel of clusters) {
          try {
            let cluster = currentClusters.get(clusterModel.id);

            if (cluster) {
              cluster.updateModel(clusterModel);
            } else {
              cluster = new Cluster(
                clusterModel,
                readClusterConfigSync(clusterModel),
              );
            }
            newClusters.set(clusterModel.id, cluster);
          } catch (error) {
            logger.warn(`[CLUSTER-STORE]: Failed to update/create a cluster: ${error}`);
          }
        }

        clustersState.replace(newClusters);
      }),
      toJSON: () => ({
        clusters: iter.chain(clustersState.values())
          .map(cluster => cluster.toJSON())
          .toArray(),
      }),
    });
  },
});

export default clustersPersistentStorageInjectable;
