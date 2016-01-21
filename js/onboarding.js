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

var OnBoarding = function(currentStep, steps, baseDir, baseAdminDir) {

    this.currentStep  = currentStep;
    this.steps        = steps;
    this.baseDir      = baseDir;
    this.baseAdminDir = baseAdminDir;
    this.templates    = [];

    this.addTemplate = function(name, content)
    {
        this.templates[name] = content;
    };

    this.showCurrentStep = function()
    {
        var step = this.getStep(this.currentStep);
        if (this.isCurrentPage(step.page)) {
            var newContent = $(this.templates[step.type]);
            newContent.find(".content").html(step.text);

            var body = $("body").prepend(newContent);
            if (step.type == 'tooltip') {
                this.placeToolTip(step);
            }

            $(".onboarding.advancement").toggle($.inArray('hideFooter', step.options) === -1);

            this.updateAdvancement();
        } else {
            // TODO: Show that it is not the current step and help the user to return to the current step
        }
    };

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

    this.gotoNextStep = function()
    {
        var currentInstance = this;
        this.save({action: 'setCurrentStep', value: this.currentStep + 1}, function(error) {
            if (!error) {
                var nextStep = currentInstance.getStep(currentInstance.currentStep + 1);
                if (null == nextStep) {
                    console.log("Here");
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
                        $(".onboarding.popup").remove();
                        $(".onboarding.tooltip").remove();
                        currentInstance.showCurrentStep();
                    }
                }
            }
        });
    };

    /**
     * Return true if the url correspond to the current page.
     *
     * @param url Url to test.
     * @return True if the url correspond to the current page.
     */
    this.isCurrentPage = function(url) {
        var currentPage = window.location.href;
        var regex;
        if(Object.prototype.toString.call(url) === '[object Array]') {
            for (var id = 0; id < url.length; id++) {
                regex = new RegExp(url[id].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
                if (regex.exec(currentPage) !== null) {
                    return true;
                }
            }
            return false;
        }

        regex = new RegExp(url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
        return regex.exec(currentPage) !== null;
    };

    this.getGroupForStep = function(stepID) {
        return this.getElementForStep(stepID, 'group');
    };

    this.getStep = function(stepID) {
        return this.getElementForStep(stepID, 'step');
    };

    this.getElementForStep = function(stepID, elementType)
    {
        var currentStepID = 0;
        for (var idGroup = 0; idGroup < this.steps['groups'].length; idGroup++) {

            var currentGroup = this.steps['groups'][idGroup];
            for (var idStep = 0; idStep < currentGroup['steps'].length; idStep++) {

                var currentStep = currentGroup['steps'][idStep];

                if (currentStepID == stepID) {
                    if (elementType == 'step') {
                        return currentStep;
                    } else if (elementType == 'group') {
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
     * @param settings Settings to save via POST.
     * @param callback Callback method called after the execution.
     */
    this.save = function(settings, callback)
    {
        var ajaxUrl = this.baseDir+"modules/onboardingv2/onboardingv2-api.php";

        $.ajax({
            method: "POST",
            url: ajaxUrl,
            data: settings
        }).done(function(result) {
            callback(result != '0');
        }).fail(function() {
            callback(true);
        });
    };

    this.updateAdvancement = function()
    {
        var advancement = $(".onboarding.advancement");
        var totalSteps = 0;

        for (var idGroup = 0; idGroup < this.steps['groups'].length; idGroup++) {
            var currentGroup = this.steps['groups'][idGroup];

            var positionOnChunk = Math.min((this.currentStep + 1) - totalSteps, currentGroup.steps.length);

            advancement.find(".group-"+idGroup+" .progress-bar").css("width", ((positionOnChunk / currentGroup.steps.length)*100)+"%");

            totalSteps += currentGroup.steps.length;
        }

        advancement.find(".group-title").html(this.getGroupForStep(this.currentStep).title);
        advancement.find(".step-title").html(this.getStep(this.currentStep).title);
    };

};
