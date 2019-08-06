export interface MenuItem {
  iconClass: string;
  title: string;
  to: string;
  pathsActive?: RegExp[];
}

export interface Path {
  path: string;
  component: any;
}

// jungeun 이런식으로 써도 되는지 다시 보기
export interface DashboardItem {
  title: string;
  kind: string;
}