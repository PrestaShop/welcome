/**
 * OnBoarding main class.
 */
class OnBoarding
{
  /**
   * Constructor.
   *
   * @param {int}     currentStep  Current step ID
   * @param {object}  steps        All steps configuration
   * @param {boolean} isShutDown   Did the OnBoarding is shut down ?
   * @param {string}  apiLocation  OnBoarding API location
   * @param {string}  baseAdminDir Base PrestaShop admin directory
   */
  constructor(currentStep, steps, isShutDown, apiLocation, baseAdminDir)
  {
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
  addTemplate(name, content)
  {
    this.templates[name] = content;
  }

  /**
   * Display the needed elements for the current step.
   */
  showCurrentStep()
  {
    $('.onboarding-navbar').toggle(this.isShutDown == true);
    $('.onboarding-advancement').toggle(this.isShutDown == false);
    $('.onboarding-popup').remove();
    $('.onboarding-tooltip').remove();

    if (!this.isShutDown) {
      var step = this.getStep(this.currentStep);

      if (OnBoarding.isCurrentPage(step.page)) {
        this.prependTemplate(step.type, step.text);

        if (step.type == 'tooltip') {
          this.placeToolTip(step);
        }

        $('.onboarding-advancement').toggle($.inArray('hideFooter', step.options) === -1);
        this.updateAdvancement();
      } else {
        $('.onboarding-advancement').toggle(false);
        this.setShutDown(true);
        //this.prependTemplate('lost');
      }
    }
  }

  /**
   * Prepend a template to a body and add the content to its '.content' element.
   *
   * @param {string} templateName Template name
   * @param {string} content      Content to add
   */
  prependTemplate(templateName, content = '')
  {
    var newContent = $(this.templates[templateName]);

    if (content != '') {
      newContent.find('.content').html(content);
    }

    var body = $('body').prepend(newContent);
  }

  /**
   * Move to the next step.
   */
  gotoNextStep()
  {
    this.gotoStep(this.currentStep + 1);
  }

  /**
   * Go to a step defined by its index.
   *
   * @param {int} stepIndex Step index
   */
  gotoStep(stepIndex)
  {
    this.save({action: 'setCurrentStep', value: stepIndex}, ((error) => {
      if (!error) {
        var currentStep = this.getStep(this.currentStep);
        var nextStep = this.getStep(stepIndex);

        if (null == nextStep) {
          $(".onboarding-popup").remove();
          $(".onboarding-navbar").remove();
          $(".onboarding-tooltip").remove();
          return;
        }

        if (null != currentStep.action) {
          $(currentStep.action.selector)[currentStep.action.action]();
        } else {
          this.currentStep++;
          if (!OnBoarding.isCurrentPage(nextStep.page)) {
            if (Array.isArray(nextStep.page)) {
              window.location.href = this.baseAdminDir + nextStep.page[0];
            } else {
              window.location.href = this.baseAdminDir + nextStep.page;
            }
          } else {
            this.showCurrentStep();
          }
        }
      }
    }));
  }

  /**
   * Stop the OnBoarding
   */
  stop()
  {
    this.save({action: 'setCurrentStep', value: this.getTotalSteps()}, (error) => {
      if (!error) {
        $(".onboarding-advancement").remove();
        $(".onboarding-navbar").remove();
        $(".onboarding-popup").remove();
        $(".onboarding-tooltip").remove();
      }
    });
  }

  /**
   * Goto the last save point step.
   */
  gotoLastSavePoint()
  {
    var lastSavePointStep = 0;
    var stepCount = 0;

    this.steps.groups.forEach((group) => {
      group.steps.forEach((step) => {
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
  getGroupForStep(stepID)
  {
    return this.getElementForStep(stepID, 'group');
  }

  /**
   * Return the current group ID.
   *
   * @return {int} Current group
   */
  getCurrentGroupID()
  {
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
  getCurrentStepIDOnGroup()
  {
    var currentStepID = 0;
    var stepID = 0;
    var stepIDOnGroup = 0;

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
  getStep(stepID)
  {
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
  getElementForStep(stepID, elementType)
  {
    var currentStepID = 0;
    var element = null;

    this.steps.groups.forEach((group) => {
      group.steps.forEach((step) => {
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
   * Call the save ajax api of the module.
   *
   * @param {object}   settings Settings to save via POST
   * @param {function} callback Callback function called after the execution
   */
  save(settings, callback)
  {
    $.ajax({
      method: "POST",
      url: this.apiLocation,
      data: settings
    }).done((result) => {
      callback('0' != result);
    }).fail(() => {
      callback(true);
    });
  }

  /**
   * Update the advancement footer.
   */
  updateAdvancement()
  {
    var advancementFooter = $('.onboarding-advancement');
    var advancementNav = $('.onboarding-navbar');
    var totalSteps = 0;

    this.steps.groups.forEach((group, index) => {
      var positionOnChunk = Math.min((this.currentStep + 1) - totalSteps, group.steps.length);
      advancementFooter.find('.group-' + index + ' .advancement').css(
          'width',
          ((positionOnChunk / group.steps.length)*100)+"%"
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
        + " - "
        + this.getGroupForStep(this.currentStep).title
    );

    if (this.getGroupForStep(this.currentStep).subtitle) {
      if (this.getGroupForStep(this.currentStep).subtitle[1]) {
        advancementFooter.find('.step-title-1').html(
            '<i class="material-icons">check</i> '
            + this.getGroupForStep(this.currentStep).subtitle[1]
        );
      }
      if (this.getGroupForStep(this.currentStep).subtitle[2]) {
        advancementFooter.find('.step-title-2').html(
            '<i class="material-icons">check</i> '
            + this.getGroupForStep(this.currentStep).subtitle[2]
        );
      }
    }

    var totalAdvancement = this.currentStep / this.getTotalSteps();
    advancementNav.find('.text').find('.text-right').html(Math.floor(totalAdvancement * 100) + '%');
    advancementNav.find('.progress-bar').width((totalAdvancement * 100) + '%');
  }

  /**
   * Return the total steps count.
   *
   * @return {int} Total steps.
   */
  getTotalSteps()
  {
    var total = 0;
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
  getTotalGroups()
  {
    return this.steps.groups.length;
  }

  /**
   * Shut down or reactivate the onBoarding.
   *
   * @param {boolean} value True to shut down, false to activate.
   */
  setShutDown(value)
  {
    this.save({action: 'setShutDown', value: value ? 1 : 0}, ((error) => {
      if (!error) {
        this.isShutDown = value;
        if (OnBoarding.isCurrentPage(this.getStep(this.currentStep).page)) {
          this.showCurrentStep();
        } else {
          this.gotoLastSavePoint();
        }
      }
    }));
  };

  /**
   * Return true if the url correspond to the current page.
   *
   * @param {(string|Array)} url Url to test
   *
   * @return {boolean} True if the url correspond to the current page
   */
  static isCurrentPage(url)
  {
    var currentPage = window.location.href;
    var regexSearch = /[-[\]{}()*+?.,\\^$|#\s]/g;
    var regexReplace = "\\$&";
    var regex;

    if($.isArray(url)) {
      var isCurrentPage = false;

      url.forEach((currentUrl) => {
        regex = new RegExp(currentUrl.replace(regexSearch, regexReplace));
        if (null !== regex.exec(currentPage)) {
          isCurrentPage = true;
        }
      });
      return isCurrentPage;
    }

    regex = new RegExp(url.replace(regexSearch, regexReplace));
    return null !== regex.exec(currentPage);
  }

  /**
   * Show a tooltip for a step.
   *
   * @param {object} step Step configuration
   */
  placeToolTip(step)
  {
    var element = $(step.selector);
    var elementOffset = element.offset();
    var tooltip = $(".onboarding-tooltip");

    tooltip.hide();

    if (!element.is(":visible")) {
      setTimeout(() => {
        this.placeToolTip(step);
      }, 100);
      return;
    }

    tooltip.show();

    var middleY = elementOffset.top + (element.outerHeight() / 2) - (tooltip.outerHeight() / 2);
    var leftX = elementOffset.left - tooltip.outerWidth();
    var rightX = elementOffset.left + element.outerWidth();

    tooltip.addClass('-'+step.position);

    switch (step.position) {
      case 'right':
        tooltip.css({left: rightX, top: middleY});
        break;
      case 'left':
        tooltip.css({left: leftX, top: middleY});
        break;
    }

    var currentStepIDOnGroup = this.getCurrentStepIDOnGroup();
    var groupStepsCount = this.getGroupForStep(this.currentStep).steps.length;

    $(function() {
      if (elementOffset.top > ((screen.height / 2) - 200)) {
        window.scrollTo(0, elementOffset.top - ((screen.height / 2) - 200));
      }
    });

    tooltip.find(".count").html((currentStepIDOnGroup + 1) + '/' + groupStepsCount);

    var bullsContainer = tooltip.find(".bulls");
    for (var idStep = 0; idStep < groupStepsCount; idStep++) {
      var newElement = $('<div></div>').addClass('bull');
      if (idStep < currentStepIDOnGroup) {
        newElement.addClass('-done');
      }
      if (idStep == currentStepIDOnGroup) {
        newElement.addClass('-current');
      }
      bullsContainer.append(newElement);
    }
  }
}

module.exports = OnBoarding;
