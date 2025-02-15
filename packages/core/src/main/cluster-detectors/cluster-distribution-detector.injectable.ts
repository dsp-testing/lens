/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { clusterMetadataDetectorInjectionToken } from "./token";
import { ClusterMetadataKey } from "../../common/cluster-types";
import { getInjectable } from "@ogre-tools/injectable";
import k8SRequestInjectable from "../k8s-request.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import requestClusterVersionInjectable from "./request-cluster-version.injectable";

const isGKE = (version: string) => version.includes("gke");
const isEKS = (version: string) => version.includes("eks");
const isIKS = (version: string) => version.includes("IKS");
const isAKS = (cluster: Cluster) => cluster.apiUrl.get().includes("azmk8s.io");
const isMirantis = (version: string) => version.includes("-mirantis-") || version.includes("-docker-");
const isDigitalOcean = (cluster: Cluster) => cluster.apiUrl.get().endsWith("k8s.ondigitalocean.com");
const isMinikube = (cluster: Cluster) => cluster.contextName.get().startsWith("minikube");
const isMicrok8s = (cluster: Cluster) => cluster.contextName.get().startsWith("microk8s");
const isKind = (cluster: Cluster) => cluster.contextName.get().startsWith("kubernetes-admin@kind-");
const isDockerDesktop = (cluster: Cluster) => cluster.contextName.get() === "docker-desktop";
const isTke = (version: string) => version.includes("-tke.");
const isCustom = (version: string) => version.includes("+");
const isVMWare = (version: string) => version.includes("+vmware");
const isRke = (version: string) => version.includes("-rancher");
const isRancherDesktop = (cluster: Cluster) => cluster.contextName.get() === "rancher-desktop";
const isK3s = (version: string) => version.includes("+k3s");
const isK0s = (version: string) => version.includes("-k0s") || version.includes("+k0s");
const isAlibaba = (version: string) => version.includes("-aliyun");
const isHuawei = (version: string) => version.includes("-CCE");

const clusterDistributionDetectorInjectable = getInjectable({
  id: "cluster-distribution-detector",
  instantiate: (di) => {
    const k8sRequest = di.inject(k8SRequestInjectable);
    const requestClusterVersion = di.inject(requestClusterVersionInjectable);
    const isOpenshift = async (cluster: Cluster) => {
      try {
        const { paths = [] } = await k8sRequest(cluster, "") as { paths?: string[] };

        return paths.includes("/apis/project.openshift.io");
      } catch (e) {
        return false;
      }
    };

    return {
      key: ClusterMetadataKey.DISTRIBUTION,
      detect: async (cluster) => {
        const version = await requestClusterVersion(cluster);

        if (isRke(version)) {
          return { value: "rke", accuracy: 80 };
        }

        if (isRancherDesktop(cluster)) {
          return { value: "rancher-desktop", accuracy: 80 };
        }

        if (isK3s(version)) {
          return { value: "k3s", accuracy: 80 };
        }

        if (isGKE(version)) {
          return { value: "gke", accuracy: 80 };
        }

        if (isEKS(version)) {
          return { value: "eks", accuracy: 80 };
        }

        if (isIKS(version)) {
          return { value: "iks", accuracy: 80 };
        }

        if (isAKS(cluster)) {
          return { value: "aks", accuracy: 80 };
        }

        if (isDigitalOcean(cluster)) {
          return { value: "digitalocean", accuracy: 90 };
        }

        if (isK0s(version)) {
          return { value: "k0s", accuracy: 80 };
        }

        if (isVMWare(version)) {
          return { value: "vmware", accuracy: 90 };
        }

        if (isMirantis(version)) {
          return { value: "mirantis", accuracy: 90 };
        }

        if (isAlibaba(version)) {
          return { value: "alibaba", accuracy: 90 };
        }

        if (isHuawei(version)) {
          return { value: "huawei", accuracy: 90 };
        }

        if (isTke(version)) {
          return { value: "tencent", accuracy: 90 };
        }

        if (isMinikube(cluster)) {
          return { value: "minikube", accuracy: 80 };
        }

        if (isMicrok8s(cluster)) {
          return { value: "microk8s", accuracy: 80 };
        }

        if (isKind(cluster)) {
          return { value: "kind", accuracy: 70 };
        }

        if (isDockerDesktop(cluster)) {
          return { value: "docker-desktop", accuracy: 80 };
        }

        if (isCustom(version)) {
          if (await isOpenshift(cluster)) {
            return { value: "openshift", accuracy: 90 };
          }

          return { value: "custom", accuracy: 10 };
        }

        return { value: "unknown", accuracy: 10 };
      },
    };
  },
  injectionToken: clusterMetadataDetectorInjectionToken,
});

export default clusterDistributionDetectorInjectable;

