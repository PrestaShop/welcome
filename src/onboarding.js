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
        var onBoardingElements = $(".onboarding");

        onBoardingElements.filter(".navbar-footer").toggle(this.isShutDown == true);
        onBoardingElements.filter(".advancement").toggle(this.isShutDown == false);
        onBoardingElements.filter(".popup").remove();
        onBoardingElements.filter(".tooltip").remove();

        if (!this.isShutDown) {
            var step = this.getStep(this.currentStep);

            if (OnBoarding.isCurrentPage(step.page)) {

                this.prependTemplate(step.type, step.text);

                if (step.type == 'tooltip') {
                    OnBoarding.placeToolTip(step);
                }

                onBoardingElements.filter(".advancement").toggle($.inArray('hideFooter', step.options) === -1);
                this.updateAdvancement();
            } else {
                onBoardingElements.filter(".advancement").toggle(false);
                this.prependTemplate('lost');
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
            newContent.find(".content").html(content);
        }

        var body = $("body").prepend(newContent);
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
                    $(".onboarding").remove();
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
                $(".onboarding").remove();
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
        var onBoardingElements = $(".onboarding");
        var advancementFooter = onBoardingElements.filter(".advancement");
        var advancementNav = onBoardingElements.filter(".navbar-footer");
        var totalSteps = 0;

        this.steps.groups.forEach((group, index) => {
            var positionOnChunk = Math.min((this.currentStep + 1) - totalSteps, group.steps.length);
            advancementFooter.find(".group-"+index+" .progress-bar").css(
                "width",
                ((positionOnChunk / group.steps.length)*100)+"%"
            );
            totalSteps += group.steps.length;
        });

        advancementFooter.find(".group-title").html(this.getGroupForStep(this.currentStep).title);
        advancementFooter.find(".step-title").html(this.getStep(this.currentStep).title);

        var totalAdvancement = this.currentStep / this.getTotalSteps();
        advancementNav.find(".text").find(".text-right").html(Math.floor(totalAdvancement * 100)+"%");
        advancementNav.find(".progress-bar").width((totalAdvancement * 100)+"%");
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
    static placeToolTip(step)
    {
        var element = $(step.selector);
        var elementOffset = element.offset();
        var tooltip = $(".onboarding.tooltip");

        var centerX = elementOffset.left + (element.outerWidth() / 2) - (tooltip.outerWidth() / 2);
        var topY = elementOffset.top - 10 - tooltip.outerHeight();
        var bottomY = elementOffset.top + 10 + element.outerHeight();
        var middleY = elementOffset.top - 20;
        var leftX = elementOffset.left - 10 - tooltip.outerWidth();
        var rightX = elementOffset.left + element.outerWidth() + 10;

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
    }
}
