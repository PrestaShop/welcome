/* eslint-disable no-underscore-dangle,no-useless-escape */
/**
 * OnBoarding main class.
 */
class OnBoarding {
  /**
   * Constructor.
   *
   * @param {int}     currentStep  Current step ID
   * @param {object}  steps        All steps configuration
   * @param {boolean} isShutDown   Did the OnBoarding is shut down ?
   * @param {string}  apiLocation  OnBoarding API location
   * @param {string}  baseAdminDir Base PrestaShop admin directory
   */
  constructor(currentStep, steps, isShutDown, apiLocation, baseAdminDir) {
    this.currentStep = currentStep;
    this.steps = steps;
    this.isShutDown = isShutDown;
    this.apiLocation = apiLocation;
    this.baseAdminDir = baseAdminDir;

    this.templates = [];
  }

  /**
   * Add a template used by the steps.
   *
   * @param {string} name    Name of the template
   * @param {string} content Content of the template
   */
  addTemplate(name, content) {
    this.templates[name] = content;
  }

  /**
   * Display the needed elements for the current step.
   */
  showCurrentStep() {
    $('.onboarding-navbar').toggleClass('displayed', !!this.isShutDown);
    $('.onboarding-advancement').toggle(this.isShutDown === false);
    $('.onboarding-popup').remove();
    $('.onboarding-tooltip').remove();

    const onBoardingHeight = $('.onboarding-navbar.displayed').innerHeight();

    // Fix the menu scroll
    if ($('#nav-sidebar').length) {
      $('#nav-sidebar').css('padding-bottom', `${onBoardingHeight + 50}px`);
    } else {
      $('nav.nav-bar ul.main-menu').css(
        'margin-bottom',
        `${onBoardingHeight}px`,
      );
    }

    if (!this.isShutDown) {
      const step = this.getStep(this.currentStep);

      if (OnBoarding.isCurrentPage(step.page)) {
        this.prependTemplate(step.type, step.text);

        if (step.type === 'tooltip') {
          this.placeToolTip(step);
        }

        $('.onboarding-advancement').toggle(
          $.inArray('hideFooter', step.options) === -1,
        );
        this.updateAdvancement();
      } else {
        $('.onboarding-advancement').toggle(false);
        this.setShutDown(true);
        // this.prependTemplate('lost');
      }
    }
  }

  /**
   * Prepend a template to a body and add the content to its '.content' element.
   *
   * @param {string} templateName Template name
   * @param {string} content      Content to add
   */
  prependTemplate(templateName, content = '') {
    const newContent = $(this.templates[templateName]);

    if (content !== '') {
      newContent.find('.content').html(content);
    }

    $('body').prepend(newContent);
  }

  /**
   * Move to the next step.
   */
  gotoNextStep() {
    this.gotoStep(this.currentStep + 1);
  }

  /**
   * Go to a step defined by its index.
   *
   * @param {int} stepIndex Step index
   */
  gotoStep(stepIndex) {
    this.save({action: 'setCurrentStep', value: stepIndex}, (error) => {
      if (!error) {
        const currentStep = this.getStep(this.currentStep);
        const nextStep = this.getStep(stepIndex);

        if (!nextStep) {
          $('.onboarding-popup').remove();
          $('.onboarding-navbar').remove();
          $('.onboarding-tooltip').remove();
          return;
        }

        if (currentStep.action) {
          $(currentStep.action.selector)[currentStep.action.action]();
        } else {
          this.currentStep += 1;
          if (!OnBoarding.isCurrentPage(nextStep.page)) {
            window.location.href = this.getRedirectUrl(nextStep);
          } else {
            this.showCurrentStep();
          }
        }
      }
    });
  }

  getTokenAsString(redirectUrl) {
    let separator;

    if (redirectUrl.indexOf('?') !== -1) {
      separator = '&';
    } else {
      separator = '?';
    }

    const queryString = window.location.search.substr(1);
    const tokens = OnBoarding.getSecurityTokens(queryString);

    let tokenAsString = separator;

    if (tokens._token !== undefined) {
      tokenAsString = `${tokenAsString}&_token=${tokens._token}`;
    }

    return tokenAsString;
  }

  getRedirectUrl(nextStep) {
    let redirectUrl;
    if (Array.isArray(nextStep.page)) {
      [redirectUrl] = nextStep.page;
    } else {
      redirectUrl = nextStep.page;
    }

    return redirectUrl + this.getTokenAsString(redirectUrl);
  }

  static parseQueryString(queryString) {
    const queryStringParts = queryString.split('&');
    const queryParams = {};
    let parts;
    let i;
    let key;
    let value;
    for (i = 0; i < queryStringParts.length; i += 1) {
      parts = queryStringParts[i].split('=');
      [key, value] = parts;
      queryParams[key] = value;
    }

    return queryParams;
  }

  /**
   * Get security tokens from URL and navigation menu
   *
   * @param queryString
   * @returns {{}}
   */
  static getSecurityTokens(queryString) {
    const queryParams = OnBoarding.parseQueryString(queryString);
    const tokens = {};

    if (typeof queryParams._token !== 'undefined') {
      tokens._token = queryParams._token;
    }

    return tokens;
  }

  /**
   * Stop the OnBoarding
   */
  stop() {
    this.save(
      {action: 'setCurrentStep', value: this.getTotalSteps()},
      (error) => {
        if (!error) {
          $('.onboarding-advancement').remove();
          $('.onboarding-navbar').remove();
          $('.onboarding-popup').remove();
          $('.onboarding-tooltip').remove();
        }
      },
    );
  }

  /**
   * Goto the last save point step.
   */
  gotoLastSavePoint() {
    let lastSavePointStep = 0;
    let stepCount = 0;

    this.steps.groups.forEach((group) => {
      group.steps.forEach((step) => {
        if (
          stepCount <= this.currentStep
          && $.inArray('savepoint', step.options) !== -1
        ) {
          lastSavePointStep = stepCount;
        }
        stepCount += 1;
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
  getGroupForStep(stepID) {
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
        if (currentStepID === this.currentStep) {
          returnValue = currentGroupID;
        }
        currentStepID += 1;
      });
      currentGroupID += 1;
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
        if (currentStepID === this.currentStep) {
          stepID = stepIDOnGroup;
        }
        stepIDOnGroup += 1;
        currentStepID += 1;
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
  getStep(stepID) {
    return this.getElementForStep(stepID, 'step');
  }

  /**
   * Return the element configuration fot a step or a group.
   *
   * @param {int}    stepID      Step ID for the element to get
   * @param {string} elementType Element type (step or group)
   *
   * @returns {(object|null)} Element configuration if it exists
   */
  getElementForStep(stepID, elementType) {
    let currentStepID = 0;
    let element = null;

    this.steps.groups.forEach((group) => {
      group.steps.forEach((step) => {
        if (currentStepID === stepID) {
          if (elementType === 'step') {
            element = step;
          } else if (elementType === 'group') {
            element = group;
          }
        }
        currentStepID += 1;
      });
    });

    return element;
  }

  /**
   * Call the save ajax api of the module.
   *
   * @param {object}   settings Settings to save via POST
   * @param {function} callback Callback function called after the execution
   */
  save(settings, callback) {
    $.ajax({
      method: 'POST',
      url: this.apiLocation,
      data: settings,
    })
      .done((result) => {
        callback(result !== '0');
      })
      .fail(() => {
        callback(true);
      });
  }

  /**
   * Update the advancement footer.
   */
  updateAdvancement() {
    const advancementFooter = $('.onboarding-advancement');
    const advancementNav = $('.onboarding-navbar');
    let totalSteps = 0;

    this.steps.groups.forEach((group, index) => {
      const positionOnChunk = Math.min(
        this.currentStep + 1 - totalSteps,
        group.steps.length,
      );
      advancementFooter
        .find(`.group-${index} .advancement`)
        .css('width', `${(positionOnChunk / group.steps.length) * 100}%`);
      totalSteps += group.steps.length;
      if (positionOnChunk === group.steps.length) {
        const id = advancementFooter.find(`.group-${index} .id`);
        if (!id.hasClass('-done')) {
          id.addClass('-done');
        }
      }
    });

    advancementFooter
      .find('.group-title')
      .html(
        `${this.getCurrentGroupID() + 1}/${this.getTotalGroups()} - ${
          this.getGroupForStep(this.currentStep).title
        }`,
      );

    if (this.getGroupForStep(this.currentStep).subtitle) {
      if (this.getGroupForStep(this.currentStep).subtitle[1]) {
        advancementFooter
          .find('.step-title-1')
          .html(
            `<i class="material-icons">check</i> ${
              this.getGroupForStep(this.currentStep).subtitle[1]
            }`,
          );
      }
      if (this.getGroupForStep(this.currentStep).subtitle[2]) {
        advancementFooter
          .find('.step-title-2')
          .html(
            `<i class="material-icons">check</i> ${
              this.getGroupForStep(this.currentStep).subtitle[2]
            }`,
          );
      }
    }

    const totalAdvancement = this.currentStep / this.getTotalSteps();
    advancementNav
      .find('.text')
      .find('.text-right')
      .html(`${Math.floor(totalAdvancement * 100)}%`);
    advancementNav.find('.progress-bar').width(`${totalAdvancement * 100}%`);
  }

  /**
   * Return the total steps count.
   *
   * @return {int} Total steps.
   */
  getTotalSteps() {
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
  getTotalGroups() {
    return this.steps.groups.length;
  }

  /**
   * Shut down or reactivate the onBoarding.
   *
   * @param {boolean} value True to shut down, false to activate.
   */
  setShutDown(value) {
    this.isShutDown = value ? 1 : 0;

    if (this.isShutDown === 1) {
      $('.onboarding-advancement').toggle(false);
      $('.onboarding-navbar').toggleClass('displayed', true);
      $('.onboarding-popup').remove();
      $('.onboarding-tooltip').remove();
    }

    this.save({action: 'setShutDown', value: this.isShutDown}, (error) => {
      if (!error) {
        if (this.isShutDown === 0) {
          if (OnBoarding.isCurrentPage(this.getStep(this.currentStep).page)) {
            this.showCurrentStep();
          } else {
            this.gotoLastSavePoint();
          }
        }
      }
    });
  }

  /**
   * Return true if the url correspond to the current page.
   *
   * @param {(string|Array)} url Url to test
   *
   * @return {boolean} True if the url correspond to the current page
   */
  static isCurrentPage(url) {
    const currentPage = window.location.href;

    let urls;
    if (!$.isArray(url)) {
      urls = [String(url)];
    } else {
      urls = url;
    }

    let isCurrentUrl = false;
    urls.forEach((currentUrl) => {
      // replace special chars for correct regexp testing
      const currentUrlFixed = currentUrl.replace(/[\?\$]/g, '\\$&');
      const urlRegexp = new RegExp(currentUrlFixed, 'i');
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
  placeToolTip(step) {
    this.tooltipElement = $(step.selector);
    this.tooltip = $('.onboarding-tooltip');

    this.tooltip.hide();

    if (!this.tooltipElement.is(':visible')) {
      setTimeout(() => {
        this.placeToolTip(step);
      }, 100);
      if (this.tooltipPlacementInterval !== undefined) {
        clearInterval(this.tooltipPlacementInterval);
      }
      return;
    }
    this.tooltipPlacementInterval = setInterval(() => {
      this.updateToolTipPosition(step);
    }, 100);

    this.tooltip.show();

    this.tooltip.addClass(`-${step.position}`);
    this.tooltip.data('position', step.position);

    const currentStepIDOnGroup = this.getCurrentStepIDOnGroup();
    const groupStepsCount = this.getGroupForStep(this.currentStep).steps.length;

    this.tooltip
      .find('.count')
      .html(`${currentStepIDOnGroup + 1}/${groupStepsCount}`);

    const bullsContainer = this.tooltip.find('.bulls');
    for (let idStep = 0; idStep < groupStepsCount; idStep += 1) {
      const newElement = $('<div></div>').addClass('bull');
      if (idStep < currentStepIDOnGroup) {
        newElement.addClass('-done');
      }
      if (idStep === currentStepIDOnGroup) {
        newElement.addClass('-current');
      }
      bullsContainer.append(newElement);
    }

    setTimeout(() => {
      if (this.tooltipElement.offset().top > window.screen.height / 2 - 200) {
        window.scrollTo(
          0,
          this.tooltipElement.offset().top - (window.screen.height / 2 - 200),
        );
      }
    }, 200);

    this.updateToolTipPosition();
  }

  /**
   * Update the position of the tooltip.
   */
  updateToolTipPosition() {
    /* eslint-disable */
    const middleX =
      this.tooltipElement.offset().top -
      this.tooltipElement.outerHeight() / 2 -
      this.tooltip.outerHeight() / 2;
    const middleY =
      this.tooltipElement.offset().top +
      this.tooltipElement.outerHeight() / 2 -
      this.tooltip.outerHeight() / 2;
    const topY =
      this.tooltipElement.offset().top +
      this.tooltipElement.outerHeight() / 2 -
      this.tooltip.outerHeight() / 2;
    /* eslint-enable */
    const leftX = this.tooltipElement.offset().left - this.tooltip.outerWidth();
    const rightX = this.tooltipElement.offset().left + this.tooltipElement.outerWidth();

    switch (this.tooltip.data('position')) {
      case 'right':
        this.tooltip.css({left: rightX, top: middleY});
        break;
      case 'left':
        this.tooltip.css({left: leftX, top: middleY});
        break;
      case 'top':
        this.tooltip.css({left: middleX, top: topY});
        break;
      default:
    }
  }
}

module.exports = OnBoarding;
