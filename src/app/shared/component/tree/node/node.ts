export interface Node {
  id: string;
  name: string;
  text?: string;
  parent: string;
  parentTrace?: Node[];
  children: Node[];
  isCheck: boolean;
  isRotate?: boolean;
}
