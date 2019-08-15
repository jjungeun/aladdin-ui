export interface MenuItem {
  iconClass: string;
  title: string;
  to: string;
  pathsActive?: RegExp[];
  groupId?: string;
}

export interface Path {
  path: string;
  component: any;
}

export enum GroupId {
  INFRASTRUCTURE= '1',
  KUBERNETES = '2',
}