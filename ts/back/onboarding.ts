/**
 * 2007-2018 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2018 PrestaShop SA
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */
// Polyfills
import '@babel/polyfill';
// Modules
import $ from 'jquery';
import ResizeObserver from 'resize-observer-polyfill';
import { throttle as _throttle } from 'lodash';
// Local
import '../../scss/module.scss';

declare let window: any;

interface ISteps {
  groups: Array<any>,
}

interface IStepGroup {
  title: string,
  subtitle: string,
  steps: Array<IStep>,
}

interface IStep {
  selector?: string,
  position?: string,
  type: string,
  text: string,
  page: string,
  options: Array<string>,
  action: IStepAction,
}

interface ITokens {
  _token: string,
}

interface IStepAction {
  action: string,
  selector: string,
}

interface IModuleSettings {
  action: string,
  value: any,
}

/**
 * OnBoarding main class.
 */
export default class OnBoarding {
  private readonly templates: Array<string>;
  private tooltip: JQuery;
  private tooltipElement: JQuery;
  private tooltipPlacementInterval: number;
  private static navbarObserver: ResizeObserver;

  /**
   * Constructor.
   *
   * @param {int}     currentStep  Current step ID
   * @param {object}  steps        All steps configuration
   * @param {boolean} isShutDown   Did the OnBoarding is shut down ?
   * @param {string}  apiLocation  OnBoarding API location
   * @param {string}  baseAdminDir Base PrestaShop admin directory
   */
  constructor(
    private currentStep: number,
    private steps: ISteps,
    private isShutDown: boolean,
    private apiLocation: string,
    private baseAdminDir: string
  ) {
    this.templates = [];
  }

  /**
   * Add a template used by the steps.
   *
   * @param {string} name    Name of the template
   * @param {string} content Content of the template
   */
  addTemplate(name: string, content: string) {
    this.templates[name] = content;
  }

  /**
   * Display the needed elements for the current step.
   */
  showCurrentStep() {
    $('.onboarding-navbar').toggleClass('displayed', this.isShutDown);
    $('.onboarding-advancement').toggle(!this.isShutDown);
    $('.onboarding-popup').remove();
    $('.onboarding-tooltip').remove();

    OnBoarding.recalculateWidth();

    if (!this.isShutDown) {
      const step = this.getStep(this.currentStep);

      if (OnBoarding.isCurrentPage(step.page)) {
        this.prependTemplate(step.type, step.text);

        if (step.type == 'tooltip') {
          this.placeToolTip(step);
        }

        $('.onboarding-advancement').toggle($.inArray('hideFooter', step.options) === -1);
        this.updateAdvancement();
      } else {
        $('.onboarding-advancement').toggle(false);
        this.setShutDown(true).then();
      }
    }
  }

  /**
   * Prepend a template to a body and add the content to its '.content' element.
   *
   * @param {string} templateName Template name
   * @param {string} content      Content to add
   */
  prependTemplate(templateName: string, content: string = '') {
    let newContent = $(this.templates[templateName]);
    if (content != '') {
      newContent.find('.content').html(content);
    }
    $('body').prepend(newContent);
  }

  /**
   * Move to the next step.
   */
  async gotoNextStep(): Promise<boolean> {
    try {
      await this.gotoStep(this.currentStep + 1);
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }

  /**
   * Go to a step defined by its index.
   *
   * @param {int} stepIndex Step index
   */
  async gotoStep(stepIndex: number): Promise<boolean> {
    try {
      await this.save({ action: 'setCurrentStep', value: stepIndex });
      let currentStep = this.getStep(this.currentStep);
      let nextStep = this.getStep(stepIndex);

      if (null == nextStep) {
        $('.onboarding-popup').remove();
        $('.onboarding-navbar').remove();
        $('.onboarding-tooltip').remove();
        return;
      }

      if (null != currentStep.action) {
        $(currentStep.action.selector)[currentStep.action.action]();
      } else {
        this.currentStep++;
        if (!OnBoarding.isCurrentPage(nextStep.page)) {
          window.location.href = OnBoarding.getRedirectUrl(nextStep);
        } else {
          this.showCurrentStep();
        }
      }
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }

  static getTokenAsString(redirectUrl: string) {
    let separator;

    if (-1 !== redirectUrl.indexOf('?')) {
      separator = '&';
    } else {
      separator = '?';
    }

    const queryString = window.location.search.substr(1);
    const tokens: ITokens = OnBoarding.getSecurityTokens(queryString);

    let tokenAsString = separator;

    if (tokens._token !== undefined) {
      tokenAsString = `${tokenAsString}&_token=${tokens._token}`;
    }

    return tokenAsString;
  }

  static getRedirectUrl(nextStep: IStep) {
    let redirectUrl;
    if ($.isArray(nextStep.page)) {
      redirectUrl = nextStep.page[0];
    } else {
      redirectUrl = nextStep.page;
    }

    return redirectUrl + OnBoarding.getTokenAsString(redirectUrl);
  }

  static parseQueryString(queryString: string) {
    const queryStringParts = queryString.split('&');
    const queryParams = {};
    let parts;
    let i;
    for (i = 0; i < queryStringParts.length; i++) {
      parts = queryStringParts[i].split('=');
      queryParams[parts[0]] = parts[1];
    }

    return queryParams;
  }

  /**
   * Get security tokens from URL and navigation menu
   *
   * @param queryString
   *
   * @returns {{}}
   */
  static getSecurityTokens(queryString: string) {
    const queryParams = OnBoarding.parseQueryString(queryString);
    const tokens: ITokens = { _token: undefined };

    if (typeof queryParams['_token'] !== 'undefined') {
      tokens._token = queryParams['_token'];
    }

    return tokens;
  }

  /**
   * Stop the OnBoarding
   */
  async stop(): Promise<boolean> {
    try {
      await this.save({ action: 'setCurrentStep', value: this.getTotalSteps() });
      $('.onboarding-advancement').remove();
      $('.onboarding-navbar').remove();
      $('.onboarding-popup').remove();
      $('.onboarding-tooltip').remove();
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }

  /**
   * Goto the last save point step.
   */
  gotoLastSavePoint() {
    let lastSavePointStep = 0;
    let stepCount = 0;

    this.steps.groups.forEach((group) => {
      group.steps.forEach((step: IStep) => {
        if (stepCount <= this.currentStep && $.inArray('savepoint', step.options) != -1) {
          lastSavePointStep = stepCount;
        }
        stepCount++;
      });
    });

    this.gotoStep(lastSavePointStep);
  }

  /**
   * Return a group configuration for a step ID.
   *
   * @param {int} stepID Step ID
   *
   * @return {object} Group configuration
   */
  getGroupForStep(stepID: number): IStepGroup {
    // @ts-ignore
    return this.getElementForStep(stepID, 'group');
  }

  /**
   * Return the current group ID.
   *
   * @return {int} Current group
   */
  getCurrentGroupID() {
    let currentGroupID = 0;
    let currentStepID = 0;
    let returnValue = 0;

    this.steps.groups.forEach((group) => {
      group.steps.forEach(() => {
        if (currentStepID == this.currentStep) {
          returnValue = currentGroupID;
        }
        currentStepID++;
      });
      currentGroupID++;
    });

    return returnValue;
  }

  /**
   * Get current step ID on the group.
   *
   * @return {int} Step ID
   */
  getCurrentStepIDOnGroup() {
    let currentStepID = 0;
    let stepID = 0;
    let stepIDOnGroup = 0;

    this.steps.groups.forEach((group) => {
      stepIDOnGroup = 0;
      group.steps.forEach(() => {
        if (currentStepID == this.currentStep) {
          stepID = stepIDOnGroup;
        }
        stepIDOnGroup++;
        currentStepID++;
      });
    });

    return stepID;
  }

  /**
   * Get the step configuration for a step ID.
   *
   * @param {int} stepID Step ID
   *
   * @return {object} Step configuration
   */
  getStep(stepID: number): IStep {
    return this.getElementForStep(stepID, 'step');
  }

  /**
   * Call the save ajax api of the module.
   *
   * @param {object} settings Settings to save via POST
   */
  save(settings: IModuleSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: 'POST',
        url: this.apiLocation,
        data: settings
      }).done((result) => {
        if ('0' !== result) {
          return reject();
        }
        return resolve();
      }).fail(() => {
        return reject();
      });
    });
  }

  /**
   * Return the element configuration fot a step or a group.
   *
   * @param {int}    stepID      Step ID for the element to get
   * @param {string} elementType Element type (step or group)
   *
   * @returns {(object|null)} Element configuration if it exists
   */
  getElementForStep(stepID: number, elementType: string): IStep {
    let currentStepID = 0;
    let element = null;

    this.steps.groups.forEach((group) => {
      group.steps.forEach((step: IStep) => {
        if (currentStepID == stepID) {
          if ('step' == elementType) {
            element = step;
          } else if ('group' == elementType) {
            element = group;
          }
        }
        currentStepID++;
      });
    });

    return element;
  }

  /**
   * Update the advancement footer.
   */
  updateAdvancement(): void {
    let advancementFooter = $('.onboarding-advancement');
    let advancementNav = $('.onboarding-navbar');
    let totalSteps = 0;

    this.steps.groups.forEach((group, index) => {
      let positionOnChunk = Math.min((this.currentStep + 1) - totalSteps, group.steps.length);
      advancementFooter.find('.group-' + index + ' .advancement').css(
        'width',
        ((positionOnChunk / group.steps.length) * 100) + '%'
      );
      totalSteps += group.steps.length;
      if (positionOnChunk == group.steps.length) {
        let id = advancementFooter.find('.group-' + index + ' .id');
        if (!id.hasClass('-done')) {
          id.addClass('-done');
        }
      }
    });

    advancementFooter.find('.group-title').html(
      (this.getCurrentGroupID() + 1) + '/' + this.getTotalGroups()
      + ' - '
      + this.getGroupForStep(this.currentStep).title
    );

    if (this.getGroupForStep(this.currentStep).subtitle) {
      if (this.getGroupForStep(this.currentStep).subtitle[1]) {
        advancementFooter.find('.step-title-1').html(
          `<i class="material-icons">check</i> ${this.getGroupForStep(this.currentStep).subtitle[1]}`
        );
      }
      if (this.getGroupForStep(this.currentStep).subtitle[2]) {
        advancementFooter.find('.step-title-2').html(
          `<i class="material-icons">check</i> ${this.getGroupForStep(this.currentStep).subtitle[2]}`
        );
      }
    }

    let totalAdvancement = this.currentStep / this.getTotalSteps();
    advancementNav.find('.text').find('.text-right').html(Math.floor(totalAdvancement * 100) + '%');
    advancementNav.find('.progress-bar').width((totalAdvancement * 100) + '%');
  }

  /**
   * Return the total steps count.
   *
   * @return {int} Total steps.
   */
  getTotalSteps(): number {
    let total = 0;
    this.steps.groups.forEach((group) => {
      total += group.steps.length;
    });
    return total;
  }

  /**
   * Return the total groups count.
   *
   * @return {int} Total groups.
   */
  getTotalGroups(): number {
    return this.steps.groups.length;
  }

  /**
   * Shut down or reactivate the onBoarding.
   *
   * @param {boolean} value True to shut down, false to activate.
   */
  async setShutDown(value: boolean): Promise<boolean> {
    this.isShutDown = value;

    if (this.isShutDown) {
      OnBoarding.hideWidget();
    }

    try {
      await this.save({ action: 'setShutDown', value: this.isShutDown ? 1 : 0 });
      if (!this.isShutDown) {
        if (OnBoarding.isCurrentPage(this.getStep(this.currentStep).page)) {
          this.showCurrentStep();
        } else {
          this.gotoLastSavePoint();
        }
      }
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      OnBoarding.hideWidget();
    }

    return true;
  };

  /**
   * Return true if the url correspond to the current page.
   *
   * @param {(string|Array)} url Url to test
   *
   * @return {boolean} True if the url correspond to the current page
   */
  static isCurrentPage(url: string|Array<string>): boolean {
    const currentPage = window.location.href;

    if (!Array.isArray(url)) {
      url = [String(url)];
    }

    let isCurrentUrl = false;
    url.forEach((currentUrl) => {
      // replace special chars for correct regexp testing
      currentUrl = currentUrl.replace(/[\?\$]/g, '\\$&');
      const urlRegexp = new RegExp(currentUrl, 'i');
      if (urlRegexp.test(currentPage)) {
        isCurrentUrl = true;
      }
    });

    return isCurrentUrl;
  }

  /**
   * Show a tooltip for a step.
   *
   * @param {object} step Step configuration
   */
  placeToolTip(step: IStep): void {
    this.tooltipElement = $(step.selector);
    this.tooltip = $('.onboarding-tooltip');

    this.tooltip.hide();

    if (!this.tooltipElement.is(':visible')) {
      setTimeout(() => {
        this.placeToolTip(step);
      }, 100);
      if (this.tooltipPlacementInterval != undefined) {
        clearInterval(this.tooltipPlacementInterval);
      }
      return;
    } else {
      this.tooltipPlacementInterval = setInterval(() => {
        this.updateToolTipPosition();
      }, 100);
    }

    this.tooltip.show();

    this.tooltip.addClass('-' + step.position);
    this.tooltip.data('position', step.position);

    let currentStepIDOnGroup = this.getCurrentStepIDOnGroup();
    let groupStepsCount = this.getGroupForStep(this.currentStep).steps.length;

    this.tooltip.find('.count').html((currentStepIDOnGroup + 1) + '/' + groupStepsCount);

    let bullsContainer = this.tooltip.find('.bulls');
    for (let idStep = 0; idStep < groupStepsCount; idStep++) {
      let newElement = $('<div></div>').addClass('bull');
      if (idStep < currentStepIDOnGroup) {
        newElement.addClass('-done');
      }
      if (idStep == currentStepIDOnGroup) {
        newElement.addClass('-current');
      }
      bullsContainer.append(newElement);
    }

    const self = this;
    setTimeout(function () {
      if (self.tooltipElement.offset().top > ((screen.height / 2) - 200)) {
        window.scrollTo(0, self.tooltipElement.offset().top - ((screen.height / 2) - 200));
      }
    }.bind(this), 200);

    this.updateToolTipPosition();
  }

  /**
   * Update the position of the tooltip.
   */
  updateToolTipPosition(): void {
    const middleX = this.tooltipElement.offset().top - (this.tooltipElement.outerHeight() / 2) - (this.tooltip.outerHeight() / 2);
    const middleY = this.tooltipElement.offset().top + (this.tooltipElement.outerHeight() / 2) - (this.tooltip.outerHeight() / 2);
    const topY = this.tooltipElement.offset().top + (this.tooltipElement.outerHeight() / 2) - (this.tooltip.outerHeight() / 2);
    const leftX = this.tooltipElement.offset().left - this.tooltip.outerWidth();
    const rightX = this.tooltipElement.offset().left + this.tooltipElement.outerWidth();

    switch (this.tooltip.data('position')) {
      case 'right':
        this.tooltip.css({ left: rightX, top: middleY });
        break;
      case 'left':
        this.tooltip.css({ left: leftX, top: middleY });
        break;
      case 'top':
        this.tooltip.css({ left: middleX, top: topY });
        break;
    }
  }

  static recalculateWidth(): void {
    OnBoarding.initCheckResize();

    const $navBar = $('nav.nav-bar');
    const $onBoardingWidget = $('.onboarding-navbar.displayed');
    const $mainMenu = $('nav.nav-bar ul.main-menu');
    const onBoardingHeight = $onBoardingWidget.innerHeight();
    // There should be a navbar
    if ($navBar.length) {
      // Check if the onboarding widget is visible
      if ($onBoardingWidget.length) {
        // Add the onboarding height to the menu, so we can still scroll to the lower items
        $mainMenu.css('margin-bottom', onBoardingHeight + 'px');
        // Calculate scrollbar width
        $onBoardingWidget.css('width', `${$navBar[0].clientWidth}px`);
      } else {
        $mainMenu.css('margin-bottom', 0);
        $onBoardingWidget.css('width', `${$navBar[0].offsetWidth}px`);
      }
    }
  }

  static hideWidget(): void {
    $('.onboarding-advancement').toggle(false);
    $('.onboarding-navbar').toggleClass('displayed', true);
    $('.onboarding-popup').remove();
    $('.onboarding-tooltip').remove();
    OnBoarding.recalculateWidth();
  }

  /**
   * Check if resize is necessary
   */
  static initCheckResize(): void {
    if (!(OnBoarding.navbarObserver instanceof ResizeObserver)) {
      // The navbar will be observed for changes
      const $navBar = $('nav.nav-bar > ul.main-menu');
      if (!$navBar.length) {
        return;
      }

      const navBar = $navBar[0];
      // Create an observer instance
      OnBoarding.navbarObserver = new ResizeObserver(_throttle(OnBoarding.recalculateWidth, 100));
      OnBoarding.navbarObserver.observe(navBar);
    }
  }
}
