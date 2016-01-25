/**
 * 2007-2016 PrestaShop
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
 * @copyright 2007-2016 PrestaShop SA
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */

/**
 * OnBoarding class.
 *
 * @param {int}    currentStep  Current step ID
 * @param {object} steps        All steps configuration
 * @param {bool}   isShutDown   Did the OnBoarding is shut down ?
 * @param {string} baseDir      Base PrestaShop directory
 * @param {string} baseAdminDir Base PrestaShop admin directory
 */
var OnBoarding = function(currentStep, steps, isShutDown, baseDir, baseAdminDir)
{
    console.info(isShutDown);
    /**
     * @member {int}
     */
    this.currentStep = currentStep;

    /**
     * @member {object}
     */
    this.steps = steps;

    /**
     * @member {string}
     */
    this.baseDir = baseDir;

    /**
     * @member {string}
     */
    this.baseAdminDir = baseAdminDir;

    /**
     * @member {Array}
     */
    this.templates = [];

    /**
     * @member {bool}
     */
    this.isShutDown = isShutDown;

    /**
     * Add a template used by the steps.
     *
     * @param {string} name    Name of the template
     * @param {string} content Content of the template
     */
    this.addTemplate = function(name, content)
    {
        this.templates[name] = content;
    };

    /**
     * Display the needed elements for the current step.
     */
    this.showCurrentStep = function()
    {
        $(".onboarding.navbar-footer").toggle(this.isShutDown == true);
        $(".onboarding.advancement").toggle(this.isShutDown == false);
        $(".onboarding.popup").remove();
        $(".onboarding.tooltip").remove();

        if (!this.isShutDown) {
            var step = this.getStep(this.currentStep);
            if (this.isCurrentPage(step.page)) {

                this.prependTemplate(step.type, step.text);

                if (step.type == 'tooltip') {
                    this.placeToolTip(step);
                }

                $(".onboarding.advancement").toggle($.inArray('hideFooter', step.options) === -1);
                this.updateAdvancement();
            } else {
                // TODO: Show that it is not the current step and help the user to return to the current step
                $(".onboarding.advancement").toggle(false);
                this.prependTemplate('lost');
            }
        }
    };

    /**
     * Prepend a template to a body and add the content to its '.content' element.
     *
     * @param {string} templateName Template name
     * @param {string} content      Content to add
     */
    this.prependTemplate = function(templateName, content)
    {
        var newContent = $(this.templates[templateName]);

        if (content != null) {
            newContent.find(".content").html(content);
        }

        var body = $("body").prepend(newContent);
    };

    /**
     * Show a tooltip for a step.
     *
     * @param {object} step Step configuration
     */
    this.placeToolTip = function(step)
    {
        var element = $(step.selector);
        var elementOffset = element.offset();
        var tooltip = $('.onboarding.tooltip');

        var centerX = elementOffset.left + (element.outerWidth() / 2) - (tooltip.outerWidth() / 2);
        var topY    = elementOffset.top - 10 - tooltip.outerHeight();
        var bottomY = elementOffset.top + 10 + element.outerHeight();
        var middleY = elementOffset.top - 20;
        var leftX   = elementOffset.left - 10 - tooltip.outerWidth();
        var rightX  = elementOffset.left + element.outerWidth() + 10;

        tooltip.addClass(step.position);

        switch (step.position) {
            case 'top':
                tooltip.css({left: centerX, top: topY});
                break;
            case 'right':
                tooltip.css({left: rightX, top: middleY});
                break;
            case 'bottom':
                tooltip.css({left: centerX, top: bottomY});
                break;
            case 'left':
                tooltip.css({left: leftX, top: middleY});
                break;
        }
    };

    /**
     * Move to the next step.
     */
    this.gotoNextStep = function()
    {
        var currentInstance = this;
        this.save({action: 'setCurrentStep', value: this.currentStep + 1}, function(error) {
            if (!error) {
                var nextStep = currentInstance.getStep(currentInstance.currentStep + 1);
                if (null == nextStep) {
                    $(".onboarding").remove();
                    return;
                }
                var currentStep = currentInstance.getStep(currentInstance.currentStep);
                if (null != currentStep.action) {
                    $(currentStep.action.selector)[currentStep.action.action]();
                } else {
                    currentInstance.currentStep++;
                    if (!currentInstance.isCurrentPage(nextStep.page)) {
                        if(Object.prototype.toString.call(nextStep.page) === '[object Array]') {
                            window.location.href = currentInstance.baseAdminDir+nextStep.page[0];
                        } else {
                            window.location.href = currentInstance.baseAdminDir+nextStep.page;
                        }
                    } else {
                        currentInstance.showCurrentStep();
                    }
                }
            }
        });
    };

    /**
     * Return true if the url correspond to the current page.
     *
     * @param {string} url Url to test
     *
     * @return {bool} True if the url correspond to the current page
     */
    this.isCurrentPage = function(url)
    {
        var currentPage = window.location.href;
        var regex;
        if('[object Array]' === Object.prototype.toString.call(url)) {
            for (var id = 0; id < url.length; id++) {
                regex = new RegExp(url[id].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
                if (null !== regex.exec(currentPage)) {
                    return true;
                }
            }
            return false;
        }

        regex = new RegExp(url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
        return null !== regex.exec(currentPage);
    };

    /**
     * Return a group configuration for a step ID.
     *
     * @param {int} stepID Step ID
     *
     * @return {object} Group configuration
     */
    this.getGroupForStep = function(stepID)
    {
        return this.getElementForStep(stepID, 'group');
    };

    /**
     * Get the step configuration for a step ID.
     *
     * @param {int} stepID Step ID
     *
     * @return {object} Step configuration
     */
    this.getStep = function(stepID)
    {
        return this.getElementForStep(stepID, 'step');
    };

    /**
     * Return the element configuration fot a step or a group.
     *
     * @param {int}    stepID      Step ID for the element to get
     * @param {string} elementType Element type (step or group)
     *
     * @returns {(object|null)} Element configuration if it exists
     */
    this.getElementForStep = function(stepID, elementType)
    {
        var currentStepID = 0;
        for (var idGroup = 0; idGroup < this.steps['groups'].length; idGroup++) {

            var currentGroup = this.steps['groups'][idGroup];
            for (var idStep = 0; idStep < currentGroup['steps'].length; idStep++) {

                var currentStep = currentGroup['steps'][idStep];

                if (currentStepID == stepID) {
                    if ('step' == elementType) {
                        return currentStep;
                    } else if ('group' == elementType) {
                        return currentGroup;
                    }
                }

                currentStepID++;
            }
        }
    };

    /**
     * Call the save ajax api of the module.
     *
     * @param {object}   settings Settings to save via POST
     * @param {callback} callback Callback function called after the execution
     */
    this.save = function(settings, callback)
    {
        var ajaxUrl = this.baseDir+"modules/onboardingv2/onboardingv2-api.php";

        $.ajax({
            method: "POST",
            url: ajaxUrl,
            data: settings
        }).done(function(result) {
            callback('0' != result);
        }).fail(function() {
            callback(true);
        });
    };

    /**
     * Update the advancement footer.
     */
    this.updateAdvancement = function()
    {
        var advancementFooter = $(".onboarding.advancement");
        var advancementNav = $(".onboarding.navbar-footer");
        var totalSteps = 0;

        for (var idGroup = 0; idGroup < this.steps['groups'].length; idGroup++) {
            var currentGroup = this.steps['groups'][idGroup];

            var positionOnChunk = Math.min((this.currentStep + 1) - totalSteps, currentGroup.steps.length);

            advancementFooter.find(".group-"+idGroup+" .progress-bar").css("width", ((positionOnChunk / currentGroup.steps.length)*100)+"%");

            totalSteps += currentGroup.steps.length;
        }

        advancementFooter.find(".group-title").html(this.getGroupForStep(this.currentStep).title);
        advancementFooter.find(".step-title").html(this.getStep(this.currentStep).title);

        var totalAdvancement = this.currentStep / totalSteps;
        advancementNav.find(".text").find(".text-right").html(Math.floor(totalAdvancement * 100)+"%");
        advancementNav.find(".progress-bar").width((totalAdvancement * 100)+"%");
    };

    /**
     * Shut down or reactivate the onBoarding.
     *
     * @param {bool} value True to shut down, false to activate.
     */
    this.setShutDown = function(value)
    {
        var currentInstance = this;
        this.save({action: 'setShutDown', value: value ? 1 : 0}, function(error) {
            if (!error) {
                currentInstance.isShutDown = value;
                currentInstance.showCurrentStep();
            }
        });
    };
};
