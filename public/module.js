/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(2);

	__webpack_require__(14);

/***/ },
/* 2 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["OnBoarding"] = __webpack_require__(15);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * OnBoarding main class.
	 */
	var OnBoarding = function () {
	  /**
	   * Constructor.
	   *
	   * @param {int}     currentStep  Current step ID
	   * @param {object}  steps        All steps configuration
	   * @param {boolean} isShutDown   Did the OnBoarding is shut down ?
	   * @param {string}  apiLocation  OnBoarding API location
	   * @param {string}  baseAdminDir Base PrestaShop admin directory
	   */
	  function OnBoarding(currentStep, steps, isShutDown, apiLocation, baseAdminDir) {
	    _classCallCheck(this, OnBoarding);

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


	  _createClass(OnBoarding, [{
	    key: 'addTemplate',
	    value: function addTemplate(name, content) {
	      this.templates[name] = content;
	    }

	    /**
	     * Display the needed elements for the current step.
	     */

	  }, {
	    key: 'showCurrentStep',
	    value: function showCurrentStep() {
	      $('.onboarding-navbar').toggleClass('displayed', this.isShutDown == true);
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

	  }, {
	    key: 'prependTemplate',
	    value: function prependTemplate(templateName) {
	      var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

	      var newContent = $(this.templates[templateName]);

	      if (content != '') {
	        newContent.find('.content').html(content);
	      }

	      var body = $('body').prepend(newContent);
	    }

	    /**
	     * Move to the next step.
	     */

	  }, {
	    key: 'gotoNextStep',
	    value: function gotoNextStep() {
	      this.gotoStep(this.currentStep + 1);
	    }

	    /**
	     * Go to a step defined by its index.
	     *
	     * @param {int} stepIndex Step index
	     */

	  }, {
	    key: 'gotoStep',
	    value: function gotoStep(stepIndex) {
	      var _this = this;

	      this.save({ action: 'setCurrentStep', value: stepIndex }, function (error) {
	        if (!error) {
	          var currentStep = _this.getStep(_this.currentStep);
	          var nextStep = _this.getStep(stepIndex);

	          if (null == nextStep) {
	            $(".onboarding-popup").remove();
	            $(".onboarding-navbar").remove();
	            $(".onboarding-tooltip").remove();
	            return;
	          }

	          if (null != currentStep.action) {
	            $(currentStep.action.selector)[currentStep.action.action]();
	          } else {
	            _this.currentStep++;
	            if (!OnBoarding.isCurrentPage(nextStep.page)) {
	              window.location.href = _this.getRedirectUrl(nextStep);
	            } else {
	              _this.showCurrentStep();
	            }
	          }
	        }
	      });
	    }
	  }, {
	    key: 'getTokenAsString',
	    value: function getTokenAsString(redirectUrl) {
	      var separator;

	      if (-1 !== redirectUrl.indexOf('?')) {
	        separator = '&';
	      } else {
	        separator = '?';
	      }

	      var queryString = window.location.search.substr(1);
	      var tokens = OnBoarding.getSecurityTokens(queryString, redirectUrl);

	      var tokenAsString = separator;

	      if (tokens.token !== undefined) {
	        tokenAsString = tokenAsString + 'token=' + tokens.token;
	      }

	      if (tokens._token !== undefined) {
	        tokenAsString = tokenAsString + '&_token=' + tokens._token;
	      }

	      return tokenAsString;
	    }
	  }, {
	    key: 'getRedirectUrl',
	    value: function getRedirectUrl(nextStep) {
	      var redirectUrl;
	      if (Array.isArray(nextStep.page)) {
	        redirectUrl = this.baseAdminDir + nextStep.page[0];
	      } else {
	        redirectUrl = this.baseAdminDir + nextStep.page;
	      }

	      return redirectUrl + this.getTokenAsString(redirectUrl);
	    }
	  }, {
	    key: 'stop',


	    /**
	     * Stop the OnBoarding
	     */
	    value: function stop() {
	      this.save({ action: 'setCurrentStep', value: this.getTotalSteps() }, function (error) {
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

	  }, {
	    key: 'gotoLastSavePoint',
	    value: function gotoLastSavePoint() {
	      var _this2 = this;

	      var lastSavePointStep = 0;
	      var stepCount = 0;

	      this.steps.groups.forEach(function (group) {
	        group.steps.forEach(function (step) {
	          if (stepCount <= _this2.currentStep && $.inArray('savepoint', step.options) != -1) {
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

	  }, {
	    key: 'getGroupForStep',
	    value: function getGroupForStep(stepID) {
	      return this.getElementForStep(stepID, 'group');
	    }

	    /**
	     * Return the current group ID.
	     *
	     * @return {int} Current group
	     */

	  }, {
	    key: 'getCurrentGroupID',
	    value: function getCurrentGroupID() {
	      var _this3 = this;

	      var currentGroupID = 0;
	      var currentStepID = 0;
	      var returnValue = 0;

	      this.steps.groups.forEach(function (group) {
	        group.steps.forEach(function () {
	          if (currentStepID == _this3.currentStep) {
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

	  }, {
	    key: 'getCurrentStepIDOnGroup',
	    value: function getCurrentStepIDOnGroup() {
	      var _this4 = this;

	      var currentStepID = 0;
	      var stepID = 0;
	      var stepIDOnGroup = 0;

	      this.steps.groups.forEach(function (group) {
	        stepIDOnGroup = 0;
	        group.steps.forEach(function () {
	          if (currentStepID == _this4.currentStep) {
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

	  }, {
	    key: 'getStep',
	    value: function getStep(stepID) {
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

	  }, {
	    key: 'getElementForStep',
	    value: function getElementForStep(stepID, elementType) {
	      var currentStepID = 0;
	      var element = null;

	      this.steps.groups.forEach(function (group) {
	        group.steps.forEach(function (step) {
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

	  }, {
	    key: 'save',
	    value: function save(settings, callback) {
	      $.ajax({
	        method: "POST",
	        url: this.apiLocation,
	        data: settings
	      }).done(function (result) {
	        callback('0' != result);
	      }).fail(function () {
	        callback(true);
	      });
	    }

	    /**
	     * Update the advancement footer.
	     */

	  }, {
	    key: 'updateAdvancement',
	    value: function updateAdvancement() {
	      var _this5 = this;

	      var advancementFooter = $('.onboarding-advancement');
	      var advancementNav = $('.onboarding-navbar');
	      var totalSteps = 0;

	      this.steps.groups.forEach(function (group, index) {
	        var positionOnChunk = Math.min(_this5.currentStep + 1 - totalSteps, group.steps.length);
	        advancementFooter.find('.group-' + index + ' .advancement').css('width', positionOnChunk / group.steps.length * 100 + "%");
	        totalSteps += group.steps.length;
	        if (positionOnChunk == group.steps.length) {
	          var id = advancementFooter.find('.group-' + index + ' .id');
	          if (!id.hasClass('-done')) {
	            id.addClass('-done');
	          }
	        }
	      });

	      advancementFooter.find('.group-title').html(this.getCurrentGroupID() + 1 + '/' + this.getTotalGroups() + " - " + this.getGroupForStep(this.currentStep).title);

	      if (this.getGroupForStep(this.currentStep).subtitle) {
	        if (this.getGroupForStep(this.currentStep).subtitle[1]) {
	          advancementFooter.find('.step-title-1').html('<i class="material-icons">check</i> ' + this.getGroupForStep(this.currentStep).subtitle[1]);
	        }
	        if (this.getGroupForStep(this.currentStep).subtitle[2]) {
	          advancementFooter.find('.step-title-2').html('<i class="material-icons">check</i> ' + this.getGroupForStep(this.currentStep).subtitle[2]);
	        }
	      }

	      var totalAdvancement = this.currentStep / this.getTotalSteps();
	      advancementNav.find('.text').find('.text-right').html(Math.floor(totalAdvancement * 100) + '%');
	      advancementNav.find('.progress-bar').width(totalAdvancement * 100 + '%');
	    }

	    /**
	     * Return the total steps count.
	     *
	     * @return {int} Total steps.
	     */

	  }, {
	    key: 'getTotalSteps',
	    value: function getTotalSteps() {
	      var total = 0;
	      this.steps.groups.forEach(function (group) {
	        total += group.steps.length;
	      });
	      return total;
	    }

	    /**
	     * Return the total groups count.
	     *
	     * @return {int} Total groups.
	     */

	  }, {
	    key: 'getTotalGroups',
	    value: function getTotalGroups() {
	      return this.steps.groups.length;
	    }

	    /**
	     * Shut down or reactivate the onBoarding.
	     *
	     * @param {boolean} value True to shut down, false to activate.
	     */

	  }, {
	    key: 'setShutDown',
	    value: function setShutDown(value) {
	      var _this6 = this;

	      this.save({ action: 'setShutDown', value: value ? 1 : 0 }, function (error) {
	        if (!error) {
	          _this6.isShutDown = value;
	          if (_this6.isShutDown == false) {
	            if (OnBoarding.isCurrentPage(_this6.getStep(_this6.currentStep).page)) {
	              _this6.showCurrentStep();
	            } else {
	              _this6.gotoLastSavePoint();
	            }
	          } else {
	            $('.onboarding-advancement').toggle(false);
	            $('.onboarding-navbar').toggleClass('displayed', true);
	            $('.onboarding-popup').remove();
	            $('.onboarding-tooltip').remove();
	          }
	        }
	      });
	    }
	  }, {
	    key: 'placeToolTip',


	    /**
	     * Show a tooltip for a step.
	     *
	     * @param {object} step Step configuration
	     */
	    value: function placeToolTip(step) {
	      var _this7 = this;

	      this.tooltipElement = $(step.selector);
	      this.tooltip = $(".onboarding-tooltip");

	      this.tooltip.hide();

	      if (!this.tooltipElement.is(":visible")) {
	        setTimeout(function () {
	          _this7.placeToolTip(step);
	        }, 100);
	        if (this.tooltipPlacementInterval != undefined) {
	          clearInterval(this.tooltipPlacementInterval);
	        }
	        return;
	      } else {
	        this.tooltipPlacementInterval = setInterval(function () {
	          _this7.updateToolTipPosition(step);
	        }, 100);
	      }

	      this.tooltip.show();

	      this.tooltip.addClass('-' + step.position);
	      this.tooltip.data('position', step.position);

	      var currentStepIDOnGroup = this.getCurrentStepIDOnGroup();
	      var groupStepsCount = this.getGroupForStep(this.currentStep).steps.length;

	      this.tooltip.find(".count").html(currentStepIDOnGroup + 1 + '/' + groupStepsCount);

	      var bullsContainer = this.tooltip.find(".bulls");
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

	      setTimeout(function () {
	        if (this.tooltipElement.offset().top > screen.height / 2 - 200) {
	          window.scrollTo(0, this.tooltipElement.offset().top - (screen.height / 2 - 200));
	        }
	      }.bind(this), 200);

	      this.updateToolTipPosition();
	    }

	    /**
	     * Update the position of the tooltip.
	     */

	  }, {
	    key: 'updateToolTipPosition',
	    value: function updateToolTipPosition() {
	      var middleX = this.tooltipElement.offset().top - this.tooltipElement.outerHeight() / 2 - this.tooltip.outerHeight() / 2;
	      var middleY = this.tooltipElement.offset().top + this.tooltipElement.outerHeight() / 2 - this.tooltip.outerHeight() / 2;
	      var topY = this.tooltipElement.offset().top + this.tooltipElement.outerHeight() / 2 - this.tooltip.outerHeight() / 2;
	      var leftX = this.tooltipElement.offset().left - this.tooltip.outerWidth();
	      var rightX = this.tooltipElement.offset().left + this.tooltipElement.outerWidth();

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
	  }], [{
	    key: 'parseQueryString',
	    value: function parseQueryString(queryString) {
	      var queryStringParts = queryString.split('&');
	      var queryParams = {};
	      var parts;
	      var i;
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
	     * @param redirectUrl
	     * @returns {{}}
	     */

	  }, {
	    key: 'getSecurityTokens',
	    value: function getSecurityTokens(queryString, redirectUrl) {
	      var queryParams = OnBoarding.parseQueryString(queryString);
	      var tokens = {};

	      if (typeof queryParams['token'] !== 'undefined') {
	        tokens.token = queryParams['token'];
	      }

	      if (typeof queryParams['_token'] !== 'undefined') {
	        tokens._token = queryParams['_token'];
	      }

	      if (redirectUrl.indexOf('?') !== -1) {
	        queryString = redirectUrl.split('?')[1];
	      } else {
	        queryString = redirectUrl;
	      }
	      var redirectUrlQueryParams = OnBoarding.parseQueryString(queryString);
	      if (typeof redirectUrlQueryParams.controller !== 'undefined') {
	        var submenu;

	        switch (redirectUrlQueryParams.controller) {
	          case 'AdminThemes':
	            submenu = '47';
	            break;
	          case 'AdminThemesCatalog':
	            submenu = '48';
	            break;
	          case 'AdminPayment':
	            submenu = '55';
	            break;
	          case 'AdminCarriers':
	            submenu = '52';
	            break;
	        }

	        if (typeof submenu !== 'undefined' && $('[data-submenu=' + submenu + '] a').length > 0) {
	          tokens.token = $($('[data-submenu=' + submenu + '] a')[0]).attr('href').split('token=')[1];
	        }
	      }

	      if (typeof tokens._token === 'undefined' && $('#subtab-AdminProducts a').length > 0) {
	        var tokenParts = $('#subtab-AdminProducts a').attr('href').split('_token=');
	        tokens._token = tokenParts[1];
	      }

	      return tokens;
	    }
	  }, {
	    key: 'isCurrentPage',


	    /**
	     * Return true if the url correspond to the current page.
	     *
	     * @param {(string|Array)} url Url to test
	     *
	     * @return {boolean} True if the url correspond to the current page
	     */
	    value: function isCurrentPage(url) {
	      var currentPage = window.location.href;
	      var regexSearch = /[-[\]{}()*+?.,\\^$|#\s]/g;
	      var regexReplace = "\\$&";
	      var regex;

	      if ($.isArray(url)) {
	        var isCurrentPage = false;

	        url.forEach(function (currentUrl) {
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
	  }]);

	  return OnBoarding;
	}();

	module.exports = OnBoarding;

/***/ }
/******/ ]);