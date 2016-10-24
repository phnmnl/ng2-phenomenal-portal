import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'fl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public isCollapsed: boolean = false;
  private logo = "assets/img/logo/phenomenal_4x.png";

  constructor(
      private _eref: ElementRef,
      private _router: Router
  ) {
  }

  ngOnInit() {
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }

  closeMenu() {
    this.isCollapsed = false;
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

}
