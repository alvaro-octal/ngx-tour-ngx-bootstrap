import { Directive, ElementRef, Host, HostBinding, Input } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { TourAnchorDirective } from '@ngx-tour/core';
import withinviewport from 'withinviewport';

import { NgxbTourService } from './ngx-bootstrap-tour.service';
import { INgxbStepOption } from './step-option.interface';
import { TourStepTemplateService } from './tour-step-template.service';
import { TourBackdropService } from './tour-backdrop.service';

@Directive({ selector: '[tourAnchor]' })
export class TourAnchorNgxBootstrapPopoverDirective extends PopoverDirective {}

@Directive({
  selector: '[tourAnchor]',
})
export class TourAnchorNgxBootstrapDirective
  implements OnInit, OnDestroy, TourAnchorDirective {
  @Input() public tourAnchor: string;

  @HostBinding('class.touranchor--is-active')
  public isActive: boolean;

  constructor(
    private tourService: NgxbTourService,
    private tourStepTemplate: TourStepTemplateService,
    private element: ElementRef,
    @Host() private popoverDirective: TourAnchorNgxBootstrapPopoverDirective,
    private tourBackdrop: TourBackdropService
  ) {
    this.popoverDirective.triggers = '';
  }

  public ngOnInit(): void {
    this.tourService.register(this.tourAnchor, this);
  }

  public ngOnDestroy(): void {
    this.tourService.unregister(this.tourAnchor);
  }

  public showTourStep(step: INgxbStepOption): void {
    this.isActive = true;
    this.popoverDirective.popover = this.tourStepTemplate.template;
    this.popoverDirective.popoverContext = { step };
    this.popoverDirective.popoverTitle = step.title;
    this.popoverDirective.container = 'body';
    this.popoverDirective.containerClass = 'ngx-bootstrap';
    if (step.containerClass) {
      this.popoverDirective.containerClass += ` ${step.containerClass}`;
    }
    this.popoverDirective.placement = step.placement || 'top';
    step.prevBtnTitle = step.prevBtnTitle || 'Prev';
    step.nextBtnTitle = step.nextBtnTitle || 'Next';
    step.endBtnTitle = step.endBtnTitle || 'End';
    this.popoverDirective.show();
    if (!step.preventScrolling) {
      if (!withinviewport(this.element.nativeElement, { sides: 'bottom' })) {
        (this.element.nativeElement as HTMLElement).scrollIntoView(false);
      } else if (
        !withinviewport(this.element.nativeElement, { sides: 'left top right' })
      ) {
        (this.element.nativeElement as HTMLElement).scrollIntoView(true);
      }
    }

    if (step.enableBackdrop) {
      this.tourBackdrop.show(this.element, step.backdropZIndex);
    } else {
      this.tourBackdrop.close();
    }
  }

  public hideTourStep(): void {
    this.isActive = false;
    this.popoverDirective.hide();
    this.tourBackdrop.close();
  }
}
