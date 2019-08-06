import { DashboardItem } from '../../types/Routes';
// jungeun
export const cardItems: DashboardItem[] = [
  {
    title: 'Nodes',
    kind: 'Kubernetes Cluster'
  },
  {
    title: 'Namespace',
    kind: 'Kubernetes Cluster'
  },
  {
    title: 'Host',
    kind: 'Infrastructure'
  },
  {
    title: 'DockerContainer',
    kind: 'Infrastructure'
  },
  {
    title: 'Daemon Sets',
    kind: 'Kubernetes Workloads'
  },
  {
    title: 'Deployments',
    kind: 'Kubernetes Workloads'
  },
  {
    title: 'Replica Sets',
    kind: 'Kubernetes Workloads'
  },
  {
    title: 'Pods',
    kind: 'Kubernetes Workloads'
  },
  {
    title: 'Cluster CPU Utilization',
    kind: 'Cluster'
  },
  {
    title: 'Cluster Memory Utilization',
    kind: 'Cluster'
  },
  {
    title: 'Cluster Pod Utilization',
    kind: 'Cluster'
  },
  {
    title: 'Node Top CPU',
    kind: 'Node'
  },
  {
    title: 'Node Top Memory',
    kind: 'Node'
  },
  {
    title: 'Pods Top CPU',
    kind: 'Pod'
  },
  {
    title: 'Pods Top Memory',
    kind: 'Pod'
  },
];