import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ph-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

  @Input() childrenNodes;

  constructor() {
  }

  ngOnInit() {
    this.constructParentTrace();
  }

  rotate(node) {
    node.isRotate = !node.isRotate;
  }

  check(currentNode, check, parentNode) {

    currentNode.isCheck = check;


    if (check === true) { // select

      if (currentNode.children.length > 0) {
        for (let n of currentNode.children) {
          this.check(n, check, parentNode);
        }
      }

      if (currentNode.children.length === 0) {


        for (let node of currentNode.parentTrace) {

          if (this.isEmptyTree(node)) {
            break;
          }
          node.isCheck = true;
        }
      }


    } else { // deselect

      if (currentNode.children.length === 0) {


        for (let node of currentNode.parentTrace) {

          if (!this.isEmptyTree(node)) {
            break;
          }
          node.isCheck = false;

        }
      }

      if (currentNode.children.length > 0) {
        for (let n of currentNode.children) {
          this.check(n, check, parentNode);
        }
      }


    }

  }

  private isEmptyTree(parentNode) {
    let isEmpty = true;

    for (let n of parentNode.children) {
      if (n.isCheck === true) {
        isEmpty = false;
        break;
      }
    }
    return isEmpty;
  }

  private constructParentTrace() {
    for (let i = 0; i < this.childrenNodes.length; i++) {
      if (this.childrenNodes[i].parent === '#') {
        this.childrenNodes[i].parentTrace = [];
        this.childrenNodes[i].isRotate = false;
        if (this.childrenNodes[i].children.length > 0) {

          for (let j = 0; j < this.childrenNodes[i].children.length; j++) {
            this.childrenNodes[i].children[j].parentTrace = [];
            let node = this.childrenNodes[i];
            this.childrenNodes[i].children[j].parentTrace.unshift(node);
            this.childrenNodes[i].children[j].isRotate = false;
          }
        }

      } else {

        if (this.childrenNodes[i].children.length > 0) {

          for (let j = 0; j < this.childrenNodes[i].children.length; j++) {

            this.childrenNodes[i].children[j].parentTrace = [];

            for (let n of this.childrenNodes[i].parentTrace) {
              this.childrenNodes[i].children[j].parentTrace.push(n);
            }

            let node = this.childrenNodes[i];
            this.childrenNodes[i].children[j].parentTrace.unshift(node);
            this.childrenNodes[i].children[j].isRotate = false;
          }
        }
      }
    }
  }

}
