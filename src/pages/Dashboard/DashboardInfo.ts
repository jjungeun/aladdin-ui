import { DashboardItem } from '../../types/DashboardCard';

export const cardItems: DashboardItem[] = [
  {
    kind: 'K8sCluster',
    title: ['Nodes', 'Namespace']
  },
  {
    kind: 'Infrastructure',
    title: ['Host', 'DockerContainer']
  },
  {
    kind: 'K8sWorkloads',
    title: ['Daemon Sets', 'Deployments', 'Replica Sets', 'Pods']
  },
  {
    kind: 'Cluster',
    title: ['Cluster CPU Utilization', 'Cluster Memory Utilization', 'Cluster Pod Utilization']
  },
  {
    kind: 'Node',
    title: ['Node Top CPU', 'Node Top Memory']
  },
  {
    kind: 'Pod',
    title: ['Pods Top CPU', 'Pods Top Memory']
  }
];