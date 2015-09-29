/*
 * Inline Form Validation Engine 2.6.1, jQuery plugin
 *
 * Copyright(c) 2010, Cedric Dugas
 * http://www.position-absolute.com
 *
 * 2.0 Rewrite by Olivier Refalo
 * http://www.crionics.com
 *
 * Form validation engine allowing custom regex rules to be added.
 * Licensed under the MIT License
 */ (function($) {

  "use strict";

  var methods = {

    /**
     * Kind of the constructor, called before any action
     * @param {Map} user options
     */
    init: function(options) {
      var form = this;
      if (!form.data('jqv') || form.data('jqv') == null) {
        options = methods._saveOptions(form, options);
        // bind all formError elements to close on click
        $(".formError").live("click", function() {
          $(this).fadeOut(150, function() {
            // remove prompt once invisible
            $(this).parent('.formErrorOuter').remove();
            $(this).remove();
          });
        });
      }
      return this;
    },
    /**
     * Attachs jQuery.validationEngine to form.submit and field.blur events
     * Takes an optional params: a list of options
     * ie. jQuery("#formID1").validationEngine('attach', {promptPosition : "centerRight"});
     */
    attach: function(userOptions) {

      if (!$(this).is("form")) {
        alert("Sorry, jqv.attach() only applies to a form");
        return this;
      }

      var form = this;
      var options;

      if (userOptions) options = methods._saveOptions(form, userOptions);
      else options = form.data('jqv');

      options.validateAttribute = (form.find("[data-validation-engine*=validate]").length) ? "data-validation-engine" : "class";
      if (options.binded) {

        // bind fields
        form.find("[" + options.validateAttribute + "*=validate]").not("[type=checkbox]").not("[type=radio]").not(".datepicker").bind(options.validationEventTrigger, methods._onFieldEvent);
        form.find("[" + options.validateAttribute + "*=validate][type=checkbox],[" + options.validateAttribute + "*=validate][type=radio]").bind("click", methods._onFieldEvent);
        form.find("[" + options.validateAttribute + "*=validate][class*=datepicker]").bind(options.validationEventTrigger, {
          "delay": 300
        }, methods._onFieldEvent);
      }
      if (options.autoPositionUpdate) {
        $(window).bind("resize", {
          "noAnimation": true,
          "formElem": form
        }, methods.updatePromptsPosition);
      }
      // bind form.submit
      form.bind("submit", methods._onSubmitEvent);
      return this;
    },
    /**
     * Unregisters any bindings that may point to jQuery.validaitonEngine
     */
    detach: function() {

      if (!$(this).is("form")) {
        alert("Sorry, jqv.detach() only applies to a form");
        return this;
      }

      var form = this;
      var options = form.data('jqv');

      // unbind fields
      form.find("[" + options.validateAttribute + "*=validate]").not("[type=checkbox]").unbind(options.validationEventTrigger, methods._onFieldEvent);
      form.find("[" + options.validateAttribute + "*=validate][type=checkbox],[class*=validate][type=radio]").unbind("click", methods._onFieldEvent);

      // unbind form.submit
      form.unbind("submit", methods.onAjaxFormComplete);

      // unbind live fields (kill)
      form.find("[" + options.validateAttribute + "*=validate]").not("[type=checkbox]").die(options.validationEventTrigger, methods._onFieldEvent);
      form.find("[" + options.validateAttribute + "*=validate][type=checkbox]").die("click", methods._onFieldEvent);

      // unbind form.submit
      form.die("submit", methods.onAjaxFormComplete);
      form.removeData('jqv');

      if (options.autoPositionUpdate) $(window).unbind("resize", methods.updatePromptsPosition);

      return this;
    },
    /**
     * Validates either a form or a list of fields, shows prompts accordingly.
     * Note: There is no ajax form validation with this method, only field ajax validation are evaluated
     *
     * @return true if the form validates, false if it fails
     */
    validate: function() {
      var element = $(this);
      var valid = null;
      if (element.is("form") && !element.hasClass('validating')) {
        element.addClass('validating');
        var options = element.data('jqv');
        valid = methods._validateFields(this);

        // If the form doesn't validate, clear the 'validating' class before the user has a chance to submit again
        setTimeout(function() {
          element.removeClass('validating');
        }, 100);
        if (valid && options.onSuccess) {
          options.onSuccess();
        } else if (!valid && options.onFailure) {
          options.onFailure();
        }
      } else if (element.is('form')) {
        element.removeClass('validating');
      } else {
        // field validation
        var form = element.closest('form');
        var options = form.data('jqv');
        valid = methods._validateField(element, options);

        if (valid && options.onFieldSuccess) options.onFieldSuccess();
        else if (options.onFieldFailure && options.InvalidFields.length > 0) {
          options.onFieldFailure();
        }
      }
      return valid;
    },
    /**
     *  Redraw prompts position, useful when you change the DOM state when validating
     */
    updatePromptsPosition: function(event) {

      if (event && this == window) {
        var form = event.data.formElem;
        var noAnimation = event.data.noAnimation;
      } else var form = $(this.closest('form'));

      var options = form.data('jqv');
      // No option, take default one
      form.find('[' + options.validateAttribute + '*=validate]').not(":disabled").each(function() {
        var field = $(this);
        if (options.prettySelect && field.is(":hidden")) field = form.find("#" + options.usePrefix + field.attr('id') + options.useSuffix);
        var prompt = methods._getPrompt(field);
        var promptText = $(prompt).find(".formErrorContent").html();

        if (prompt) methods._updatePrompt(field, $(prompt), promptText, undefined, false, options, noAnimation);
      });
      return this;
    },
    /**
     * Displays a prompt on a element.
     * Note that the element needs an id!
     *
     * @param {String} promptText html text to display type
     * @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
     * @param {String} possible values topLeft, topRight, bottomLeft, centerRight, bottomRight
     */
    showPrompt: function(promptText, type, promptPosition, showArrow) {

      var form = this.closest('form');
      var options = form.data('jqv');
      // No option, take default one
      if (!options) options = methods._saveOptions(this, options);
      if (promptPosition) options.promptPosition = promptPosition;
      options.showArrow = showArrow == true;

      methods._showPrompt(this, promptText, type, false, options);
      return this;
    },
    /**
     * Closes form error prompts, CAN be invidual
     */
    hide: function() {
      var form = $(this).closest('form');
      var options = form.data('jqv');
      var fadeDuration = (options && options.fadeDuration) ? options.fadeDuration : 0.3;
      var closingtag;

      if ($(this).is("form")) {
        closingtag = "parentForm" + methods._getClassName($(this).attr("id"));
      } else {
        closingtag = methods._getClassName($(this).attr("id")) + "formError";
      }
      $('.' + closingtag).fadeTo(fadeDuration, 0.3, function() {
        $(this).parent('.formErrorOuter').remove();
        $(this).remove();
      });
      return this;
    },
    /**
     * Closes all error prompts on the page
     */
    hideAll: function() {

      var form = this;
      var options = form.data('jqv');
      var duration = options ? options.fadeDuration : 0.3;
      $('.formError').fadeTo(duration, 0.3, function() {
        $(this).parent('.formErrorOuter').remove();
        $(this).remove();
      });
      return this;
    },
    /**
     * Typically called when user exists a field using tab or a mouse click, triggers a field
     * validation
     */
    _onFieldEvent: function(event) {
      var field = $(this);
      var form = field.closest('form');
      var options = form.data('jqv');
      options.eventTrigger = "field";
      // validate the current field
      window.setTimeout(function() {
        methods._validateField(field, options);
        if (options.InvalidFields.length == 0 && options.onFieldSuccess) {
          options.onFieldSuccess();
        } else if (options.InvalidFields.length > 0 && options.onFieldFailure) {
          options.onFieldFailure();
        }
      }, (event.data) ? event.data.delay : 0);

    },
    /**
     * Called when the form is submited, shows prompts accordingly
     *
     * @param {jqObject}
     *            form
     * @return false if form submission needs to be cancelled
     */
    _onSubmitEvent: function() {
      var form = $(this);
      var options = form.data('jqv');
      options.eventTrigger = "submit";

      // validate each field 
      // (- skip field ajax validation, not necessary IF we will perform an ajax form validation)
      var r = methods._validateFields(form);

      if (r && options.ajaxFormValidation) {
        methods._validateFormWithAjax(form, options);
        // cancel form auto-submission - process with async call onAjaxFormComplete
        return false;
      }

      if (options.onValidationComplete) {
        // !! ensures that an undefined return is interpreted as return false but allows a onValidationComplete() to possibly return true and have form continue processing
        return !!options.onValidationComplete(form, r);
      }
      return r;
    },
    /**
     * Return true if the ajax field validations passed so far
     * @param {Object} options
     * @return true, is all ajax validation passed so far (remember ajax is async)
     */
    _checkAjaxStatus: function(options) {
      var status = true;
      $.each(options.ajaxValidCache, function(key, value) {
        if (!value) {
          status = false;
          // break the each
          return false;
        }
      });
      return status;
    },

    /**
     * Return true if the ajax field is validated
     * @param {String} fieldid
     * @param {Object} options
     * @return true, if validation passed, false if false or doesn't exist
     */
    _checkAjaxFieldStatus: function(fieldid, options) {
      return options.ajaxValidCache[fieldid] == true;
    },
    /**
     * Validates form fields, shows prompts accordingly
     *
     * @param {jqObject}
     *            form
     * @param {skipAjaxFieldValidation}
     *            boolean - when set to true, ajax field validation is skipped, typically used when the submit button is clicked
     *
     * @return true if form is valid, false if not, undefined if ajax form validation is done
     */
    _validateFields: function(form) {
      var options = form.data('jqv');

      // this variable is set to true if an error is found
      var errorFound = false;

      // Trigger hook, start validation
      form.trigger("jqv.form.validating");
      // first, evaluate status of non ajax fields
      var first_err = null;
      form.find('[' + options.validateAttribute + '*=validate]').not(":disabled").each(function() {
        var field = $(this);
        var names = [];
        if ($.inArray(field.attr('name'), names) < 0) {
          errorFound |= methods._validateField(field, options);
          if (errorFound && first_err == null) if (field.is(":hidden") && options.prettySelect) first_err = field = form.find("#" + options.usePrefix + methods._jqSelector(field.attr('id')) + options.useSuffix);
          else first_err = field;
          if (options.doNotShowAllErrosOnSubmit) return false;
          names.push(field.attr('name'));

          //if option set, stop checking validation rules after one error is found
          if (options.showOneMessage == true && errorFound) {
            return false;
          }
        }
      });

      // second, check to see if all ajax calls completed ok
      // errorFound |= !methods._checkAjaxStatus(options);

      // third, check status and scroll the container accordingly
      form.trigger("jqv.form.result", [errorFound]);

      if (errorFound) {
        if (options.scroll) {
          var destination = first_err.offset().top;
          var fixleft = first_err.offset().left;

          //prompt positioning adjustment support. Usage: positionType:Xshift,Yshift (for ex.: bottomLeft:+20 or bottomLeft:-20,+10)
          var positionType = options.promptPosition;
          if (typeof(positionType) == 'string' && positionType.indexOf(":") != -1) positionType = positionType.substring(0, positionType.indexOf(":"));

          if (positionType != "bottomRight" && positionType != "bottomLeft") {
            var prompt_err = methods._getPrompt(first_err);
            if (prompt_err) {
              destination = prompt_err.offset().top;
            }
          }

          // get the position of the first error, there should be at least one, no need to check this
          //var destination = form.find(".formError:not('.greenPopup'):first").offset().top;
          if (options.isOverflown) {
            var overflowDIV = $(options.overflownDIV);
            if (!overflowDIV.length) return false;
            var scrollContainerScroll = overflowDIV.scrollTop();
            var scrollContainerPos = -parseInt(overflowDIV.offset().top);

            destination += scrollContainerScroll + scrollContainerPos - 5;
            var scrollContainer = $(options.overflownDIV + ":not(:animated)");

            scrollContainer.animate({
              scrollTop: destination
            }, 1100, function() {
              if (options.focusFirstField) first_err.focus();
            });

          } else {
            $("html, body").animate({
              scrollTop: destination
            }, 1100, function() {
              if (options.focusFirstField) first_err.focus();
            });
            $("html, body").animate({
              scrollLeft: fixleft
            }, 1100)
          }

        } else if (options.focusFirstField) first_err.focus();
        return false;
      }
      return true;
    },
    /**
     * This method is called to perform an ajax form validation.
     * During this process all the (field, value) pairs are sent to the server which returns a list of invalid fields or true
     *
     * @param {jqObject} form
     * @param {Map} options
     */
    _validateFormWithAjax: function(form, options) {

      var data = form.serialize();
      var type = (options.ajaxFormValidationMethod) ? options.ajaxFormValidationMethod : "GET";
      var url = (options.ajaxFormValidationURL) ? options.ajaxFormValidationURL : form.attr("action");
      var dataType = (options.dataType) ? options.dataType : "json";
      $.ajax({
        type: type,
        url: url,
        cache: false,
        dataType: dataType,
        data: data,
        form: form,
        methods: methods,
        options: options,
        beforeSend: function() {
          return options.onBeforeAjaxFormValidation(form, options);
        },
        error: function(data, transport) {
          methods._ajaxError(data, transport);
        },
        success: function(json) {
          if ((dataType == "json") && (json !== true)) {
            // getting to this case doesn't necessary means that the form is invalid
            // the server may return green or closing prompt actions
            // this flag helps figuring it out
            var errorInForm = false;
            for (var i = 0; i < json.length; i++) {
              var value = json[i];

              var errorFieldId = value[0];
              var errorField = $($("#" + errorFieldId)[0]);

              // make sure we found the element
              if (errorField.length == 1) {

                // promptText or selector
                var msg = value[2];
                // if the field is valid
                if (value[1] == true) {

                  if (msg == "" || !msg) {
                    // if for some reason, status==true and error="", just close the prompt
                    methods._closePrompt(errorField);
                  } else {
                    // the field is valid, but we are displaying a green prompt
                    if (options.allrules[msg]) {
                      var txt = options.allrules[msg].alertTextOk;
                      if (txt) msg = txt;
                    }
                    methods._showPrompt(errorField, msg, "pass", false, options, true);
                  }
                } else {
                  // the field is invalid, show the red error prompt
                  errorInForm |= true;
                  if (options.allrules[msg]) {
                    var txt = options.allrules[msg].alertText;
                    if (txt) msg = txt;
                  }
                  methods._showPrompt(errorField, msg, "", false, options, true);
                }
              }
            }
            options.onAjaxFormComplete(!errorInForm, form, json, options);
          } else options.onAjaxFormComplete(true, form, json, options);

        }
      });

    },
    /**
     * Validates field, shows prompts accordingly
     *
     * @param {jqObject}
     *            field
     * @param {Array[String]}
     *            field's validation rules
     * @param {Map}
     *            user options
     * @return false if field is valid (It is inversed for *fields*, it return false on validate and true on errors.)
     */
    _validateField: function(field, options, skipAjaxValidation) {
      if (!field.attr("id")) {
        field.attr("id", "form-validation-field-" + $.validationEngine.fieldIdCounter);
        ++$.validationEngine.fieldIdCounter;
      }

      if (field.is(":hidden") && !options.prettySelect || field.parent().is(":hidden")) return false;

      var rulesParsing = field.attr(options.validateAttribute);
      var getRules = /validate\[(.*)\]/.exec(rulesParsing);

      if (!getRules) return false;
      var str = getRules[1];
      var rules = str.split(/\[|,|\]/);

      // true if we ran the ajax validation, tells the logic to stop messing with prompts
      var isAjaxValidator = false;
      var fieldName = field.attr("name");
      var promptText = "";
      var promptType = "";
      var required = false;
      var limitErrors = false;
      options.isError = false;
      options.showArrow = true;

      // If the programmer wants to limit the amount of error messages per field,
      if (options.maxErrorsPerField > 0) {
        limitErrors = true;
      }

      var form = $(field.closest("form"));
      // Fix for adding spaces in the rules
      for (var i = 0; i < rules.length; i++) {
        rules[i] = rules[i].replace(" ", "");
        // Remove any parsing errors
        if (rules[i] === '') {
          delete rules[i];
        }
      }

      for (var i = 0, field_errors = 0; i < rules.length; i++) {

        // If we are limiting errors, and have hit the max, break
        if (limitErrors && field_errors >= options.maxErrorsPerField) {
          // If we haven't hit a required yet, check to see if there is one in the validation rules for this
          // field and that it's index is greater or equal to our current index
          if (!required) {
            var have_required = $.inArray('required', rules);
            required = (have_required != -1 && have_required >= i);
          }
          break;
        }


        var errorMsg = undefined;
        switch (rules[i]) {

        case "required":
          required = true;
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._required);
          break;
        case "custom":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._custom);
          break;
        case "groupRequired":
          // Check is its the first of group, if not, reload validation with first field
          // AND continue normal validation on present field
          var classGroup = "[" + options.validateAttribute + "*=" + rules[i + 1] + "]";
          var firstOfGroup = form.find(classGroup).eq(0);
          if (firstOfGroup[0] != field[0]) {

            methods._validateField(firstOfGroup, options, skipAjaxValidation);
            options.showArrow = true;

          }
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._groupRequired);
          if (errorMsg) required = true;
          options.showArrow = false;
          break;
        case "ajax":
          // AJAX defaults to returning it's loading message
          errorMsg = methods._ajax(field, rules, i, options);
          if (errorMsg) {
            promptType = "load";
          }
          break;
        case "minSize":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._minSize);
          break;
        case "maxSize":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._maxSize);
          break;
        case "min":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._min);
          break;
        case "max":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._max);
          break;
        case "past":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._past);
          break;
        case "future":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._future);
          break;
        case "dateRange":
          var classGroup = "[" + options.validateAttribute + "*=" + rules[i + 1] + "]";
          options.firstOfGroup = form.find(classGroup).eq(0);
          options.secondOfGroup = form.find(classGroup).eq(1);

          //if one entry out of the pair has value then proceed to run through validation
          if (options.firstOfGroup[0].value || options.secondOfGroup[0].value) {
            errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._dateRange);
          }
          if (errorMsg) required = true;
          options.showArrow = false;
          break;

        case "dateTimeRange":
          var classGroup = "[" + options.validateAttribute + "*=" + rules[i + 1] + "]";
          options.firstOfGroup = form.find(classGroup).eq(0);
          options.secondOfGroup = form.find(classGroup).eq(1);

          //if one entry out of the pair has value then proceed to run through validation
          if (options.firstOfGroup[0].value || options.secondOfGroup[0].value) {
            errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._dateTimeRange);
          }
          if (errorMsg) required = true;
          options.showArrow = false;
          break;
        case "maxCheckbox":
          field = $(form.find("input[name='" + fieldName + "']"));
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._maxCheckbox);
          break;
        case "minCheckbox":
          field = $(form.find("input[name='" + fieldName + "']"));
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._minCheckbox);
          break;
        case "equals":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._equals);
          break;
        case "funcCall":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._funcCall);
          break;
        case "creditCard":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._creditCard);
          break;
        case "condRequired":
          errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._condRequired);
          if (errorMsg !== undefined) {
            required = true;
          }
          break;

        default:
        }

        var end_validation = false;

        // If we were passed back an message object, check what the status was to determine what to do
        if (typeof errorMsg == "object") {
          switch (errorMsg.status) {
          case "_break":
            end_validation = true;
            break;
            // If we have an error message, set errorMsg to the error message
          case "_error":
            errorMsg = errorMsg.message;
            break;
            // If we want to throw an error, but not show a prompt, return early with true
          case "_error_no_prompt":
            return true;
            break;
            // Anything else we continue on
          default:
            break;
          }
        }

        // If it has been specified that validation should end now, break
        if (end_validation) {
          break;
        }

        // If we have a string, that means that we have an error, so add it to the error message.
        if (typeof errorMsg == 'string') {
          promptText += errorMsg + "<br/>";
          options.isError = true;
          field_errors++;
        }
      }
      // If the rules required is not added, an empty field is not validated
      if (!required && field.val().length < 1) options.isError = false;

      // Hack for radio/checkbox group button, the validation go into the
      // first radio/checkbox of the group
      var fieldType = field.prop("type");

      if ((fieldType == "radio" || fieldType == "checkbox") && form.find("input[name='" + fieldName + "']").size() > 1) {
        field = $(form.find("input[name='" + fieldName + "'][type!=hidden]:first"));
        options.showArrow = false;
      }

      if (field.is(":hidden") && options.prettySelect) {
        field = form.find("#" + options.usePrefix + methods._jqSelector(field.attr('id')) + options.useSuffix);
      }

      if (options.isError) {
        methods._showPrompt(field, promptText, promptType, false, options);
      } else {
        if (!isAjaxValidator) methods._closePrompt(field);
      }

      if (!isAjaxValidator) {
        field.trigger("jqv.field.result", [field, options.isError, promptText]);
      }

      /* Record error */
      var errindex = $.inArray(field[0], options.InvalidFields);
      if (errindex == -1) {
        if (options.isError) options.InvalidFields.push(field[0]);
      } else if (!options.isError) {
        options.InvalidFields.splice(errindex, 1);
      }

      methods._handleStatusCssClasses(field, options);

      return options.isError;
    },
    /**
     * Handling css classes of fields indicating result of validation 
     *
     * @param {jqObject}
     *            field
     * @param {Array[String]}
     *            field's validation rules            
     * @private
     */
    _handleStatusCssClasses: function(field, options) {
      /* remove all classes */
      if (options.addSuccessCssClassToField) field.removeClass(options.addSuccessCssClassToField);

      if (options.addFailureCssClassToField) field.removeClass(options.addFailureCssClassToField);

      /* Add classes */
      if (options.addSuccessCssClassToField && !options.isError) field.addClass(options.addSuccessCssClassToField);

      if (options.addFailureCssClassToField && options.isError) field.addClass(options.addFailureCssClassToField);
    },

    /********************
     * _getErrorMessage
     *
     * @param form
     * @param field
     * @param rule
     * @param rules
     * @param i
     * @param options
     * @param originalValidationMethod
     * @return {*}
     * @private
     */
    _getErrorMessage: function(form, field, rule, rules, i, options, originalValidationMethod) {
      // If we are using the custon validation type, build the index for the rule.
      // Otherwise if we are doing a function call, make the call and return the object
      // that is passed back.
      var beforeChangeRule = rule;
      if (rule == "custom") {
        var custom_validation_type_index = jQuery.inArray(rule, rules) + 1;
        var custom_validation_type = rules[custom_validation_type_index];
        rule = "custom[" + custom_validation_type + "]";
      }
      var element_classes = (field.attr("data-validation-engine")) ? field.attr("data-validation-engine") : field.attr("class");
      var element_classes_array = element_classes.split(" ");

      // Call the original validation method. If we are dealing with dates or checkboxes, also pass the form
      var errorMsg;
      if (rule == "future" || rule == "past" || rule == "maxCheckbox" || rule == "minCheckbox") {
        errorMsg = originalValidationMethod(form, field, rules, i, options);
      } else {
        errorMsg = originalValidationMethod(field, rules, i, options);
      }

      // If the original validation method returned an error and we have a custom error message,
      // return the custom message instead. Otherwise return the original error message.
      if (errorMsg != undefined) {
        var custom_message = methods._getCustomErrorMessage($(field), element_classes_array, beforeChangeRule, options);
        if (custom_message) errorMsg = custom_message;
      }
      return errorMsg;

    },
    _getCustomErrorMessage: function(field, classes, rule, options) {
      var custom_message = false;
      var validityProp = methods._validityProp[rule];
      // If there is a validityProp for this rule, check to see if the field has an attribute for it
      if (validityProp != undefined) {
        custom_message = field.attr("data-errormessage-" + validityProp);
        // If there was an error message for it, return the message
        if (custom_message != undefined) return custom_message;
      }
      custom_message = field.attr("data-errormessage");
      // If there is an inline custom error message, return it
      if (custom_message != undefined) return custom_message;
      var id = '#' + field.attr("id");
      // If we have custom messages for the element's id, get the message for the rule from the id.
      // Otherwise, if we have custom messages for the element's classes, use the first class message we find instead.
      if (typeof options.custom_error_messages[id] != "undefined" && typeof options.custom_error_messages[id][rule] != "undefined") {
        custom_message = options.custom_error_messages[id][rule]['message'];
      } else if (classes.length > 0) {
        for (var i = 0; i < classes.length && classes.length > 0; i++) {
          var element_class = "." + classes[i];
          if (typeof options.custom_error_messages[element_class] != "undefined" && typeof options.custom_error_messages[element_class][rule] != "undefined") {
            custom_message = options.custom_error_messages[element_class][rule]['message'];
            break;
          }
        }
      }
      if (!custom_message && typeof options.custom_error_messages[rule] != "undefined" && typeof options.custom_error_messages[rule]['message'] != "undefined") {
        custom_message = options.custom_error_messages[rule]['message'];
      }
      return custom_message;
    },
    _validityProp: {
      "required": "value-missing",
      "custom": "custom-error",
      "groupRequired": "value-missing",
      "ajax": "custom-error",
      "minSize": "range-underflow",
      "maxSize": "range-overflow",
      "min": "range-underflow",
      "max": "range-overflow",
      "past": "type-mismatch",
      "future": "type-mismatch",
      "dateRange": "type-mismatch",
      "dateTimeRange": "type-mismatch",
      "maxCheckbox": "range-overflow",
      "minCheckbox": "range-underflow",
      "equals": "pattern-mismatch",
      "funcCall": "custom-error",
      "creditCard": "pattern-mismatch",
      "condRequired": "value-missing"
    },
    /**
     * Required validation
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @param {bool} condRequired flag when method is used for internal purpose in condRequired check
     * @return an error string if validation failed
     */
    _required: function(field, rules, i, options, condRequired) {
      switch (field.prop("type")) {
      case "text":
      case "password":
      case "textarea":
      case "file":
      case "select-one":
      case "select-multiple":
      default:

        if (!$.trim(field.val()) || field.val() == field.attr("data-validation-placeholder") || field.val() == field.attr("placeholder")) return options.allrules[rules[i]].alertText;
        break;
      case "radio":
      case "checkbox":
        // new validation style to only check dependent field
        if (condRequired) {
          if (!field.attr('checked')) {
            return options.allrules[rules[i]].alertTextCheckboxMultiple;
          }
          break;
        }
        // old validation style
        var form = field.closest("form");
        var name = field.attr("name");
        if (form.find("input[name='" + name + "']:checked").size() == 0) {
          if (form.find("input[name='" + name + "']:visible").size() == 1) return options.allrules[rules[i]].alertTextCheckboxe;
          else return options.allrules[rules[i]].alertTextCheckboxMultiple;
        }
        break;
      }
    },
    /**
     * Validate that 1 from the group field is required
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _groupRequired: function(field, rules, i, options) {
      var classGroup = "[" + options.validateAttribute + "*=" + rules[i + 1] + "]";
      var isValid = false;
      // Check all fields from the group
      field.closest("form").find(classGroup).each(function() {
        if (!methods._required($(this), rules, i, options)) {
          isValid = true;
          return false;
        }
      });

      if (!isValid) {
        return options.allrules[rules[i]].alertText;
      }
    },
    /**
     * Validate rules
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _custom: function(field, rules, i, options) {
      var customRule = rules[i + 1];
      var rule = options.allrules[customRule];
      var fn;
      if (!rule) {
        alert("jqv:custom rule not found - " + customRule);
        return;
      }

      if (rule["regex"]) {
        var ex = rule.regex;
        if (!ex) {
          alert("jqv:custom regex not found - " + customRule);
          return;
        }
        var pattern = new RegExp(ex);

        if (!pattern.test(field.val())) return options.allrules[customRule].alertText;

      } else if (rule["func"]) {
        fn = rule["func"];

        if (typeof(fn) !== "function") {
          alert("jqv:custom parameter 'function' is no function - " + customRule);
          return;
        }

        if (!fn(field, rules, i, options)) return options.allrules[customRule].alertText;
      } else {
        alert("jqv:custom type not allowed " + customRule);
        return;
      }
    },
    /**
     * Validate custom function outside of the engine scope
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _funcCall: function(field, rules, i, options) {
      var functionName = rules[i + 1];
      var fn;
      if (functionName.indexOf('.') > -1) {
        var namespaces = functionName.split('.');
        var scope = window;
        while (namespaces.length) {
          scope = scope[namespaces.shift()];
        }
        fn = scope;
      } else fn = window[functionName] || options.customFunctions[functionName];
      if (typeof(fn) == 'function') return fn(field, rules, i, options);

    },
    /**
     * Field match
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _equals: function(field, rules, i, options) {
      var equalsField = rules[i + 1];

      if (field.val() != $("#" + equalsField).val()) return options.allrules.equals.alertText;
    },
    /**
     * Check the maximum size (in characters)
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _maxSize: function(field, rules, i, options) {
      var max = rules[i + 1];
      var len = field.val().length;

      if (len > max) {
        var rule = options.allrules.maxSize;
        return rule.alertText + max + rule.alertText2;
      }
    },
    /**
     * Check the minimum size (in characters)
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _minSize: function(field, rules, i, options) {
      var min = rules[i + 1];
      var len = field.val().length;

      if (len < min) {
        var rule = options.allrules.minSize;
        return rule.alertText + min + rule.alertText2;
      }
    },
    /**
     * Check number minimum value
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _min: function(field, rules, i, options) {
      var min = parseFloat(rules[i + 1]);
      var len = parseFloat(field.val());

      if (len < min) {
        var rule = options.allrules.min;
        if (rule.alertText2) return rule.alertText + min + rule.alertText2;
        return rule.alertText + min;
      }
    },
    /**
     * Check number maximum value
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _max: function(field, rules, i, options) {
      var max = parseFloat(rules[i + 1]);
      var len = parseFloat(field.val());

      if (len > max) {
        var rule = options.allrules.max;
        if (rule.alertText2) return rule.alertText + max + rule.alertText2;
        //orefalo: to review, also do the translations
        return rule.alertText + max;
      }
    },
    /**
     * Checks date is in the past
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _past: function(form, field, rules, i, options) {

      var p = rules[i + 1];
      var fieldAlt = $(form.find("input[name='" + p.replace(/^#+/, '') + "']"));
      var pdate;

      if (p.toLowerCase() == "now") {
        pdate = new Date();
      } else if (undefined != fieldAlt.val()) {
        if (fieldAlt.is(":disabled")) return;
        pdate = methods._parseDate(fieldAlt.val());
      } else {
        pdate = methods._parseDate(p);
      }
      var vdate = methods._parseDate(field.val());

      if (vdate > pdate) {
        var rule = options.allrules.past;
        if (rule.alertText2) return rule.alertText + methods._dateToString(pdate) + rule.alertText2;
        return rule.alertText + methods._dateToString(pdate);
      }
    },
    /**
     * Checks date is in the future
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _future: function(form, field, rules, i, options) {

      var p = rules[i + 1];
      var fieldAlt = $(form.find("input[name='" + p.replace(/^#+/, '') + "']"));
      var pdate;

      if (p.toLowerCase() == "now") {
        pdate = new Date();
      } else if (undefined != fieldAlt.val()) {
        if (fieldAlt.is(":disabled")) return;
        pdate = methods._parseDate(fieldAlt.val());
      } else {
        pdate = methods._parseDate(p);
      }
      var vdate = methods._parseDate(field.val());

      if (vdate < pdate) {
        var rule = options.allrules.future;
        if (rule.alertText2) return rule.alertText + methods._dateToString(pdate) + rule.alertText2;
        return rule.alertText + methods._dateToString(pdate);
      }
    },
    /**
     * Checks if valid date
     *
     * @param {string} date string
     * @return a bool based on determination of valid date
     */
    _isDate: function(value) {
      var dateRegEx = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/);
      return dateRegEx.test(value);
    },
    /**
     * Checks if valid date time
     *
     * @param {string} date string
     * @return a bool based on determination of valid date time
     */
    _isDateTime: function(value) {
      var dateTimeRegEx = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/);
      return dateTimeRegEx.test(value);
    },
    //Checks if the start date is before the end date
    //returns true if end is later than start
    _dateCompare: function(start, end) {
      return (new Date(start.toString()) < new Date(end.toString()));
    },
    /**
     * Checks date range
     *
     * @param {jqObject} first field name
     * @param {jqObject} second field name
     * @return an error string if validation failed
     */
    _dateRange: function(field, rules, i, options) {
      //are not both populated
      if ((!options.firstOfGroup[0].value && options.secondOfGroup[0].value) || (options.firstOfGroup[0].value && !options.secondOfGroup[0].value)) {
        return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
      }

      //are not both dates
      if (!methods._isDate(options.firstOfGroup[0].value) || !methods._isDate(options.secondOfGroup[0].value)) {
        return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
      }

      //are both dates but range is off
      if (!methods._dateCompare(options.firstOfGroup[0].value, options.secondOfGroup[0].value)) {
        return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
      }
    },
    /**
     * Checks date time range
     *
     * @param {jqObject} first field name
     * @param {jqObject} second field name
     * @return an error string if validation failed
     */
    _dateTimeRange: function(field, rules, i, options) {
      //are not both populated
      if ((!options.firstOfGroup[0].value && options.secondOfGroup[0].value) || (options.firstOfGroup[0].value && !options.secondOfGroup[0].value)) {
        return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
      }
      //are not both dates
      if (!methods._isDateTime(options.firstOfGroup[0].value) || !methods._isDateTime(options.secondOfGroup[0].value)) {
        return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
      }
      //are both dates but range is off
      if (!methods._dateCompare(options.firstOfGroup[0].value, options.secondOfGroup[0].value)) {
        return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
      }
    },
    /**
     * Max number of checkbox selected
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _maxCheckbox: function(form, field, rules, i, options) {

      var nbCheck = rules[i + 1];
      var groupname = field.attr("name");
      var groupSize = form.find("input[name='" + groupname + "']:checked").size();
      if (groupSize > nbCheck) {
        options.showArrow = false;
        if (options.allrules.maxCheckbox.alertText2) return options.allrules.maxCheckbox.alertText + " " + nbCheck + " " + options.allrules.maxCheckbox.alertText2;
        return options.allrules.maxCheckbox.alertText;
      }
    },
    /**
     * Min number of checkbox selected
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _minCheckbox: function(form, field, rules, i, options) {

      var nbCheck = rules[i + 1];
      var groupname = field.attr("name");
      var groupSize = form.find("input[name='" + groupname + "']:checked").size();
      if (groupSize < nbCheck) {
        options.showArrow = false;
        return options.allrules.minCheckbox.alertText + " " + nbCheck + " " + options.allrules.minCheckbox.alertText2;
      }
    },
    /**
     * Checks that it is a valid credit card number according to the
     * Luhn checksum algorithm.
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return an error string if validation failed
     */
    _creditCard: function(field, rules, i, options) {
      //spaces and dashes may be valid characters, but must be stripped to calculate the checksum.
      var valid = false,
        cardNumber = field.val().replace(/ +/g, '').replace(/-+/g, '');

      var numDigits = cardNumber.length;
      if (numDigits >= 14 && numDigits <= 16 && parseInt(cardNumber) > 0) {

        var sum = 0,
          i = numDigits - 1,
          pos = 1,
          digit, luhn = new String();
        do {
          digit = parseInt(cardNumber.charAt(i));
          luhn += (pos++ % 2 == 0) ? digit * 2 : digit;
        } while (--i >= 0)

        for (i = 0; i < luhn.length; i++) {
          sum += parseInt(luhn.charAt(i));
        }
        valid = sum % 10 == 0;
      }
      if (!valid) return options.allrules.creditCard.alertText;
    },
    /**
     * Ajax field validation
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     *            user options
     * @return nothing! the ajax validator handles the prompts itself
     */
    _ajax: function(field, rules, i, options) {

      var errorSelector = rules[i + 1];
      var rule = options.allrules[errorSelector];
      var extraData = rule.extraData;
      var extraDataDynamic = rule.extraDataDynamic;
      var data = {
        "fieldId": field.attr("id"),
        "fieldValue": field.val()
      };

      if (typeof extraData === "object") {
        $.extend(data, extraData);
      } else if (typeof extraData === "string") {
        var tempData = extraData.split("&");
        for (var i = 0; i < tempData.length; i++) {
          var values = tempData[i].split("=");
          if (values[0] && values[0]) {
            data[values[0]] = values[1];
          }
        }
      }

      if (extraDataDynamic) {
        var tmpData = [];
        var domIds = String(extraDataDynamic).split(",");
        for (var i = 0; i < domIds.length; i++) {
          var id = domIds[i];
          if ($(id).length) {
            var inputValue = field.closest("form").find(id).val();
            var keyValue = id.replace('#', '') + '=' + escape(inputValue);
            data[id.replace('#', '')] = inputValue;
          }
        }
      }

      // If a field change event triggered this we want to clear the cache for this ID
      if (options.eventTrigger == "field") {
        delete(options.ajaxValidCache[field.attr("id")]);
      }

      // If there is an error or if the the field is already validated, do not re-execute AJAX
      if (!options.isError && !methods._checkAjaxFieldStatus(field.attr("id"), options)) {
        $.ajax({
          type: options.ajaxFormValidationMethod,
          url: rule.url,
          cache: false,
          dataType: "json",
          data: data,
          field: field,
          rule: rule,
          methods: methods,
          options: options,
          beforeSend: function() {},
          error: function(data, transport) {
            methods._ajaxError(data, transport);
          },
          success: function(json) {

            // asynchronously called on success, data is the json answer from the server
            var errorFieldId = json[0];
            //var errorField = $($("#" + errorFieldId)[0]);
            var errorField = $("#" + errorFieldId).eq(0);

            // make sure we found the element
            if (errorField.length == 1) {
              var status = json[1];
              // read the optional msg from the server
              var msg = json[2];
              if (!status) {
                // Houston we got a problem - display an red prompt
                options.ajaxValidCache[errorFieldId] = false;
                options.isError = true;

                // resolve the msg prompt
                if (msg) {
                  if (options.allrules[msg]) {
                    var txt = options.allrules[msg].alertText;
                    if (txt) {
                      msg = txt;
                    }
                  }
                } else msg = rule.alertText;

                methods._showPrompt(errorField, msg, "", true, options);
              } else {
                options.ajaxValidCache[errorFieldId] = true;

                // resolves the msg prompt
                if (msg) {
                  if (options.allrules[msg]) {
                    var txt = options.allrules[msg].alertTextOk;
                    if (txt) {
                      msg = txt;
                    }
                  }
                } else msg = rule.alertTextOk;

                // see if we should display a green prompt
                if (msg) methods._showPrompt(errorField, msg, "pass", true, options);
                else methods._closePrompt(errorField);

                // If a submit form triggered this, we want to re-submit the form
                if (options.eventTrigger == "submit") field.closest("form").submit();
              }
            }
            errorField.trigger("jqv.field.result", [errorField, options.isError, msg]);
          }
        });

        return rule.alertTextLoad;
      }
    },
    /**
     * Common method to handle ajax errors
     *
     * @param {Object} data
     * @param {Object} transport
     */
    _ajaxError: function(data, transport) {
      if (data.status == 0 && transport == null) alert("The page is not served from a server! ajax call failed");
      else if (typeof console != "undefined") console.log("Ajax error: " + data.status + " " + transport);
    },
    /**
     * date -> string
     *
     * @param {Object} date
     */
    _dateToString: function(date) {
      return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    },
    /**
     * Parses an ISO date
     * @param {String} d
     */
    _parseDate: function(d) {

      var dateParts = d.split("-");
      if (dateParts == d) dateParts = d.split("/");
      return new Date(dateParts[0], (dateParts[1] - 1), dateParts[2]);
    },
    /**
     * Builds or updates a prompt with the given information
     *
     * @param {jqObject} field
     * @param {String} promptText html text to display type
     * @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
     * @param {boolean} ajaxed - use to mark fields than being validated with ajax
     * @param {Map} options user options
     */
    _showPrompt: function(field, promptText, type, ajaxed, options, ajaxform) {
      var prompt = methods._getPrompt(field);
      // The ajax submit errors are not see has an error in the form,
      // When the form errors are returned, the engine see 2 bubbles, but those are ebing closed by the engine at the same time
      // Because no error was found befor submitting
      if (ajaxform) prompt = false;
      if (prompt) methods._updatePrompt(field, prompt, promptText, type, ajaxed, options);
      else methods._buildPrompt(field, promptText, type, ajaxed, options);
    },
    /**
     * Builds and shades a prompt for the given field.
     *
     * @param {jqObject} field
     * @param {String} promptText html text to display type
     * @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
     * @param {boolean} ajaxed - use to mark fields than being validated with ajax
     * @param {Map} options user options
     */
    _buildPrompt: function(field, promptText, type, ajaxed, options) {

      // create the prompt
      var prompt = $('<div>');
      prompt.addClass(methods._getClassName(field.attr("id")) + "formError");
      // add a class name to identify the parent form of the prompt
      prompt.addClass("parentForm" + methods._getClassName(field.parents('form').attr("id")));
      prompt.addClass("formError");

      switch (type) {
      case "pass":
        prompt.addClass("greenPopup");
        break;
      case "load":
        prompt.addClass("blackPopup");
        break;
      default:
        /* it has error  */
        //alert("unknown popup type:"+type);
      }
      if (ajaxed) prompt.addClass("ajaxed");

      // create the prompt content
      var promptContent = $('<div>').addClass("formErrorContent").html(promptText).appendTo(prompt);
      // create the css arrow pointing at the field
      // note that there is no triangle on max-checkbox and radio
      if (options.showArrow) {
        var arrow = $('<div>').addClass("formErrorArrow");

        //prompt positioning adjustment support. Usage: positionType:Xshift,Yshift (for ex.: bottomLeft:+20 or bottomLeft:-20,+10)
        var positionType = field.data("promptPosition") || options.promptPosition;
        if (typeof(positionType) == 'string') {
          var pos = positionType.indexOf(":");
          if (pos != -1) positionType = positionType.substring(0, pos);
        }

        switch (positionType) {
        case "bottomLeft":
        case "bottomRight":
          prompt.find(".formErrorContent").before(arrow);
          arrow.addClass("formErrorArrowBottom").html('<div class="line1"><!-- --></div><div class="line2"><!-- --></div><div class="line3"><!-- --></div><div class="line4"><!-- --></div><div class="line5"><!-- --></div><div class="line6"><!-- --></div><div class="line7"><!-- --></div><div class="line8"><!-- --></div><div class="line9"><!-- --></div><div class="line10"><!-- --></div>');
          break;
        case "topLeft":
        case "topRight":
          arrow.html('<div class="line10"><!-- --></div><div class="line9"><!-- --></div><div class="line8"><!-- --></div><div class="line7"><!-- --></div><div class="line6"><!-- --></div><div class="line5"><!-- --></div><div class="line4"><!-- --></div><div class="line3"><!-- --></div><div class="line2"><!-- --></div><div class="line1"><!-- --></div>');
          prompt.append(arrow);
          break;
        }
      }
      // Add custom prompt class
      if (options.addPromptClass) prompt.addClass(options.addPromptClass);

      prompt.css({
        "opacity": 0,
        'position': 'absolute'
      });
      field.before(prompt);

      var pos = methods._calculatePosition(field, prompt, options);
      prompt.css({
        "top": pos.callerTopPosition,
        "left": pos.callerleftPosition,
        "marginTop": pos.marginTopSize,
        "opacity": 0
      }).data("callerField", field);

      if (options.autoHidePrompt) {
        setTimeout(function() {
          prompt.animate({
            "opacity": 0
          }, function() {
            prompt.closest('.formErrorOuter').remove();
            prompt.remove();
          });
        }, options.autoHideDelay);
      }
      return prompt.animate({
        "opacity": 0.87
      });
    },
    /**
     * Updates the prompt text field - the field for which the prompt
     * @param {jqObject} field
     * @param {String} promptText html text to display type
     * @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
     * @param {boolean} ajaxed - use to mark fields than being validated with ajax
     * @param {Map} options user options
     */
    _updatePrompt: function(field, prompt, promptText, type, ajaxed, options, noAnimation) {

      if (prompt) {
        if (typeof type !== "undefined") {
          if (type == "pass") prompt.addClass("greenPopup");
          else prompt.removeClass("greenPopup");

          if (type == "load") prompt.addClass("blackPopup");
          else prompt.removeClass("blackPopup");
        }
        if (ajaxed) prompt.addClass("ajaxed");
        else prompt.removeClass("ajaxed");

        prompt.find(".formErrorContent").html(promptText);

        var pos = methods._calculatePosition(field, prompt, options);
        var css = {
          "top": pos.callerTopPosition,
          "left": pos.callerleftPosition,
          "marginTop": pos.marginTopSize
        };

        if (noAnimation) prompt.css(css);
        else prompt.animate(css);
      }
    },
    /**
     * Closes the prompt associated with the given field
     *
     * @param {jqObject}
     *            field
     */
    _closePrompt: function(field) {
      var prompt = methods._getPrompt(field);
      if (prompt) prompt.fadeTo("fast", 0, function() {
        prompt.parent('.formErrorOuter').remove();
        prompt.remove();
      });
    },
    closePrompt: function(field) {
      return methods._closePrompt(field);
    },
    /**
     * Returns the error prompt matching the field if any
     *
     * @param {jqObject}
     *            field
     * @return undefined or the error prompt (jqObject)
     */
    _getPrompt: function(field) {
      var formId = $(field).closest('form').attr('id');
      var className = methods._getClassName(field.attr("id")) + "formError";
      var match = $("." + methods._escapeExpression(className) + '.parentForm' + formId)[0];
      if (match) return $(match);
    },
    /**
     * Returns the escapade classname
     *
     * @param {selector}
     *            className
     */
    _escapeExpression: function(selector) {
      return selector.replace(/([#;&,\.\+\*\~':"\!\^$\[\]\(\)=>\|])/g, "\\$1");
    },
    /**
     * returns true if we are in a RTLed document
     *
     * @param {jqObject} field
     */
    isRTL: function(field) {
      var $document = $(document);
      var $body = $('body');
      var rtl = (field && field.hasClass('rtl')) || (field && (field.attr('dir') || '').toLowerCase() === 'rtl') || $document.hasClass('rtl') || ($document.attr('dir') || '').toLowerCase() === 'rtl' || $body.hasClass('rtl') || ($body.attr('dir') || '').toLowerCase() === 'rtl';
      return Boolean(rtl);
    },
    /**
     * Calculates prompt position
     *
     * @param {jqObject}
     *            field
     * @param {jqObject}
     *            the prompt
     * @param {Map}
     *            options
     * @return positions
     */
    _calculatePosition: function(field, promptElmt, options) {

      var promptTopPosition, promptleftPosition, marginTopSize;
      var fieldWidth = field.width();
      var fieldLeft = field.position().left;
      var fieldTop = field.position().top;
      var fieldHeight = field.height();
      var promptHeight = promptElmt.height();


      // is the form contained in an overflown container?
      promptTopPosition = promptleftPosition = 0;
      // compensation for the arrow
      marginTopSize = -promptHeight;


      //prompt positioning adjustment support
      //now you can adjust prompt position
      //usage: positionType:Xshift,Yshift
      //for example:
      //   bottomLeft:+20 means bottomLeft position shifted by 20 pixels right horizontally
      //   topRight:20, -15 means topRight position shifted by 20 pixels to right and 15 pixels to top
      //You can use +pixels, - pixels. If no sign is provided than + is default.
      var positionType = field.data("promptPosition") || options.promptPosition;
      var shift1 = "";
      var shift2 = "";
      var shiftX = 0;
      var shiftY = 0;
      if (typeof(positionType) == 'string') {
        //do we have any position adjustments ?
        if (positionType.indexOf(":") != -1) {
          shift1 = positionType.substring(positionType.indexOf(":") + 1);
          positionType = positionType.substring(0, positionType.indexOf(":"));

          //if any advanced positioning will be needed (percents or something else) - parser should be added here
          //for now we use simple parseInt()

          //do we have second parameter?
          if (shift1.indexOf(",") != -1) {
            shift2 = shift1.substring(shift1.indexOf(",") + 1);
            shift1 = shift1.substring(0, shift1.indexOf(","));
            shiftY = parseInt(shift2);
            if (isNaN(shiftY)) shiftY = 0;
          };

          shiftX = parseInt(shift1);
          if (isNaN(shift1)) shift1 = 0;

        };
      };


      switch (positionType) {
        default: case "topRight":
        promptleftPosition += fieldLeft + fieldWidth - 30;
        promptTopPosition += fieldTop;
        break;

      case "topLeft":
        promptTopPosition += fieldTop;
        promptleftPosition += fieldLeft;
        break;

      case "centerRight":
        promptTopPosition = fieldTop + 4;
        marginTopSize = 0;
        promptleftPosition = fieldLeft + field.outerWidth(true) + 5;
        break;
      case "centerLeft":
        promptleftPosition = fieldLeft - (promptElmt.width() + 2);
        promptTopPosition = fieldTop + 4;
        marginTopSize = 0;

        break;

      case "bottomLeft":
        promptTopPosition = fieldTop + field.height() + 5;
        marginTopSize = 0;
        promptleftPosition = fieldLeft;
        break;
      case "bottomRight":
        promptleftPosition = fieldLeft + fieldWidth - 30;
        promptTopPosition = fieldTop + field.height() + 5;
        marginTopSize = 0;
      };



      //apply adjusments if any
      promptleftPosition += shiftX;
      promptTopPosition += shiftY;

      return {
        "callerTopPosition": promptTopPosition + "px",
        "callerleftPosition": promptleftPosition + "px",
        "marginTopSize": marginTopSize + "px"
      };
    },
    /**
     * Saves the user options and variables in the form.data
     *
     * @param {jqObject}
     *            form - the form where the user option should be saved
     * @param {Map}
     *            options - the user options
     * @return the user options (extended from the defaults)
     */
    _saveOptions: function(form, options) {

      // is there a language localisation ?
      if ($.validationEngineLanguage) var allRules = $.validationEngineLanguage.allRules;
      else $.error("jQuery.validationEngine rules are not loaded, plz add localization files to the page");
      // --- Internals DO NOT TOUCH or OVERLOAD ---
      // validation rules and i18
      $.validationEngine.defaults.allrules = allRules;

      var userOptions = $.extend(true, {}, $.validationEngine.defaults, options);

      form.data('jqv', userOptions);
      return userOptions;
    },

    /**
     * Removes forbidden characters from class name
     * @param {String} className
     */
    _getClassName: function(className) {
      if (className) return className.replace(/:/g, "_").replace(/\./g, "_");
    },
    /**
     * Escape special character for jQuery selector
     * http://totaldev.com/content/escaping-characters-get-valid-jquery-id
     * @param {String} selector
     */
    _jqSelector: function(str) {
      return str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
    },
    /**
     * Conditionally required field
     *
     * @param {jqObject} field
     * @param {Array[String]} rules
     * @param {int} i rules index
     * @param {Map}
     * user options
     * @return an error string if validation failed
     */
    _condRequired: function(field, rules, i, options) {
      var idx, dependingField;

      for (idx = (i + 1); idx < rules.length; idx++) {
        dependingField = jQuery("#" + rules[idx]).first();

        /* Use _required for determining wether dependingField has a value.
         * There is logic there for handling all field types, and default value; so we won't replicate that here
         * Indicate this special use by setting the last parameter to true so we only validate the dependingField on chackboxes and radio buttons (#462)
         */
        if (dependingField.length && methods._required(dependingField, ["required"], 0, options, true) == undefined) {
          /* We now know any of the depending fields has a value,
           * so we can validate this field as per normal required code
           */
          return methods._required(field, ["required"], 0, options);
        }
      }
    }
  };

  /**
   * Plugin entry point.
   * You may pass an action as a parameter or a list of options.
   * if none, the init and attach methods are being called.
   * Remember: if you pass options, the attached method is NOT called automatically
   *
   * @param {String}
   *            method (optional) action
   */
  $.fn.validationEngine = function(method) {

    var form = $(this);
    if (!form[0]) return form; // stop here if the form does not exist
    if (typeof(method) == 'string' && method.charAt(0) != '_' && methods[method]) {

      // make sure init is called once
      if (method != "showPrompt" && method != "hide" && method != "hideAll") methods.init.apply(form);

      return methods[method].apply(form, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method == 'object' || !method) {

      // default constructor with or without arguments
      methods.init.apply(form, arguments);
      return methods.attach.apply(form);
    } else {
      $.error('Method ' + method + ' does not exist in jQuery.validationEngine');
    }
  };



  // LEAK GLOBAL OPTIONS
  $.validationEngine = {
    fieldIdCounter: 0,
    defaults: {

      // Name of the event triggering field validation
      validationEventTrigger: "blur",
      // Automatically scroll viewport to the first error
      scroll: true,
      // Focus on the first input
      focusFirstField: true,
      // Opening box position, possible locations are: topLeft,
      // topRight, bottomLeft, centerRight, bottomRight
      promptPosition: "topRight",
      bindMethod: "bind",
      // internal, automatically set to true when it parse a _ajax rule
      inlineAjax: false,
      // if set to true, the form data is sent asynchronously via ajax to the form.action url (get)
      ajaxFormValidation: false,
      // The url to send the submit ajax validation (default to action)
      ajaxFormValidationURL: false,
      // HTTP method used for ajax validation
      ajaxFormValidationMethod: 'get',
      // Ajax form validation callback method: boolean onComplete(form, status, errors, options)
      // retuns false if the form.submit event needs to be canceled.
      onAjaxFormComplete: $.noop,
      // called right before the ajax call, may return false to cancel
      onBeforeAjaxFormValidation: $.noop,
      // Stops form from submitting and execute function assiciated with it
      onValidationComplete: false,

      // Used when you have a form fields too close and the errors messages are on top of other disturbing viewing messages
      doNotShowAllErrosOnSubmit: false,
      // Object where you store custom messages to override the default error messages
      custom_error_messages: {},
      // true if you want to vind the input fields
      binded: true,
      // set to true, when the prompt arrow needs to be displayed
      showArrow: true,
      // did one of the validation fail ? kept global to stop further ajax validations
      isError: false,
      // Limit how many displayed errors a field can have
      maxErrorsPerField: false,

      // Caches field validation status, typically only bad status are created.
      // the array is used during ajax form validation to detect issues early and prevent an expensive submit
      ajaxValidCache: {},
      // Auto update prompt position after window resize
      autoPositionUpdate: false,

      InvalidFields: [],
      onFieldSuccess: false,
      onFieldFailure: false,
      onSuccess: false,
      onFailure: false,
      addSuccessCssClassToField: false,
      addFailureCssClassToField: false,

      // Auto-hide prompt
      autoHidePrompt: false,
      // Delay before auto-hide
      autoHideDelay: 10000,
      // Fade out duration while hiding the validations
      fadeDuration: 0.3,
      // Use Prettify select library
      prettySelect: false,
      // Add css class on prompt
      addPromptClass: "",
      // Custom ID uses prefix
      usePrefix: "",
      // Custom ID uses suffix
      useSuffix: "",
      // Only show one message per error prompt
      showOneMessage: false
    }
  };
  $(function() {
    $.validationEngine.defaults.promptPosition = methods.isRTL() ? 'topLeft' : "topRight"
  });
})(jQuery);

/* Limita quantidade de caracteres */
(function($) {
	$.fn.extend( {
		limit: function(limit,element) {
			var interval;
			var self = $(this);

			$(this).focus(function(){
				interval = window.setInterval(substring,100);
			});

			$(this).blur(function(){
				clearInterval(interval);
				substring();
			});

			function substring(){
				var length = $(self).val().replace(/(\r\n|\n|\r|\s+|\\)/gm,' ').length;
				var count;
				if (element) {
					count = (limit-length<=0)?'0':limit-length;
				}

				$(element).html("Ainda faltam "+ count +" caracteres");

				if (length > limit) {
					$(self).val($(self).val().substring(0,limit));
				}
			}

			substring();

		}
	});
})(jQuery);

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

// place any jQuery/helper plugins in here, instead of separate, slower script files.

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend(jQuery.easing, {
  def: 'easeOutQuad',
  swing: function(x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function(x, t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  easeOutQuad: function(x, t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },
  easeInOutQuad: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
  },
  easeInCubic: function(x, t, b, c, d) {
    return c * (t /= d) * t * t + b;
  },
  easeOutCubic: function(x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  },
  easeInOutCubic: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
  },
  easeInQuart: function(x, t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
  },
  easeOutQuart: function(x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  easeInOutQuart: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
  },
  easeInQuint: function(x, t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  easeOutQuint: function(x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  easeInOutQuint: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  },
  easeInSine: function(x, t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
  },
  easeOutSine: function(x, t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
  },
  easeInOutSine: function(x, t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
  },
  easeInExpo: function(x, t, b, c, d) {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  },
  easeOutExpo: function(x, t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  },
  easeInOutExpo: function(x, t, b, c, d) {
    if (t == 0) return b;
    if (t == d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function(x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  },
  easeOutCirc: function(x, t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  },
  easeInOutCirc: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
  },
  easeInElastic: function(x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  },
  easeOutElastic: function(x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
  },
  easeInOutElastic: function(x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d / 2) == 2) return b + c;
    if (!p) p = d * (.3 * 1.5);
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
  },
  easeInBack: function(x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
  easeOutBack: function(x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  },
  easeInOutBack: function(x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
  },
  easeInBounce: function(x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
  },
  easeOutBounce: function(x, t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
      return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
      return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
      return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
      return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
  },
  easeInOutBounce: function(x, t, b, c, d) {
    if (t < d / 2) return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
    return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
  }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright Â© 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */


/*! http://mths.be/placeholder v2.0.7 by @mathias */
;
(function(window, document, $) {

  var isInputSupported = 'placeholder' in document.createElement('input'),
    isTextareaSupported = 'placeholder' in document.createElement('textarea'),
    prototype = $.fn,
    valHooks = $.valHooks,
    hooks, placeholder;

  if (isInputSupported && isTextareaSupported) {

    placeholder = prototype.placeholder = function() {
      return this;
    };

    placeholder.input = placeholder.textarea = true;

  } else {

    placeholder = prototype.placeholder = function() {
      var $this = this;
      $this.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]').not('.placeholder').bind({
        'focus.placeholder': clearPlaceholder,
        'blur.placeholder': setPlaceholder
      }).data('placeholder-enabled', true).trigger('blur.placeholder');
      return $this;
    };

    placeholder.input = isInputSupported;
    placeholder.textarea = isTextareaSupported;

    hooks = {
      'get': function(element) {
        var $element = $(element);
        return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
      },
      'set': function(element, value) {
        var $element = $(element);
        if (!$element.data('placeholder-enabled')) {
          return element.value = value;
        }
        if (value == '') {
          element.value = value;
          // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
          if (element != document.activeElement) {
            // We can't use `triggerHandler` here because of dummy text/password inputs :(
            setPlaceholder.call(element);
          }
        } else if ($element.hasClass('placeholder')) {
          clearPlaceholder.call(element, true, value) || (element.value = value);
        } else {
          element.value = value;
        }
        // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
        return $element;
      }
    };

    isInputSupported || (valHooks.input = hooks);
    isTextareaSupported || (valHooks.textarea = hooks);

    $(function() {
      // Look for forms
      $(document).delegate('form', 'submit.placeholder', function() {
        // Clear the placeholder values so they don't get submitted
        var $inputs = $('.placeholder', this).each(clearPlaceholder);
        setTimeout(function() {
          $inputs.each(setPlaceholder);
        }, 10);
      });
    });

    // Clear placeholder values upon page reload
    $(window).bind('beforeunload.placeholder', function() {
      $('.placeholder').each(function() {
        this.value = '';
      });
    });

  }

  function args(elem) {
    // Return an object of element attributes
    var newAttrs = {},
      rinlinejQuery = /^jQuery\d+$/;
    $.each(elem.attributes, function(i, attr) {
      if (attr.specified && !rinlinejQuery.test(attr.name)) {
        newAttrs[attr.name] = attr.value;
      }
    });
    return newAttrs;
  }

  function clearPlaceholder(event, value) {
    var input = this,
      $input = $(input);
    if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
      if ($input.data('placeholder-password')) {
        $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
        // If `clearPlaceholder` was called from `$.valHooks.input.set`
        if (event === true) {
          return $input[0].value = value;
        }
        $input.focus();
      } else {
        input.value = '';
        $input.removeClass('placeholder');
        input == document.activeElement && input.select();
      }
    }
  }

  function setPlaceholder() {
    var $replacement, input = this,
      $input = $(input),
      $origInput = $input,
      id = this.id;
    if (input.value == '') {
      if (input.type == 'password') {
        if (!$input.data('placeholder-textinput')) {
          try {
            $replacement = $input.clone().attr({
              'type': 'text'
            });
          } catch (e) {
            $replacement = $('<input>').attr($.extend(args(this), {
              'type': 'text'
            }));
          }
          $replacement.removeAttr('name').data({
            'placeholder-password': true,
            'placeholder-id': id
          }).bind('focus.placeholder', clearPlaceholder);
          $input.data({
            'placeholder-textinput': $replacement,
            'placeholder-id': id
          }).before($replacement);
        }
        $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
        // Note: `$input[0] != input` now!
      }
      $input.addClass('placeholder');
      $input[0].value = $input.attr('placeholder');
    } else {
      $input.removeClass('placeholder');
    }
  }

}(this, document, jQuery));


/*
  Masked Input plugin for jQuery
  Copyright (c) 2007-2011 Josh Bush (digitalbush.com)
  Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
  Version: 1.3
*/
(function(a) {
  var b = (a.browser.msie ? "paste" : "input") + ".mask",
    c = window.orientation != undefined;
  a.mask = {
    definitions: {
      9: "[0-9]",
      a: "[A-Za-z]",
      "*": "[A-Za-z0-9]"
    },
    dataName: "rawMaskFn"
  }, a.fn.extend({
    caret: function(a, b) {
      if (this.length != 0) {
        if (typeof a == "number") {
          b = typeof b == "number" ? b : a;
          return this.each(function() {
            if (this.setSelectionRange) this.setSelectionRange(a, b);
            else if (this.createTextRange) {
              var c = this.createTextRange();
              c.collapse(!0), c.moveEnd("character", b), c.moveStart("character", a), c.select()
            }
          })
        }
        if (this[0].setSelectionRange) a = this[0].selectionStart, b = this[0].selectionEnd;
        else if (document.selection && document.selection.createRange) {
          var c = document.selection.createRange();
          a = 0 - c.duplicate().moveStart("character", -1e5), b = a + c.text.length
        }
        return {
          begin: a,
          end: b
        }
      }
    },
    unmask: function() {
      return this.trigger("unmask")
    },
    mask: function(d, e) {
      if (!d && this.length > 0) {
        var f = a(this[0]);
        return f.data(a.mask.dataName)()
      }
      e = a.extend({
        placeholder: "_",
        completed: null
      }, e);
      var g = a.mask.definitions,
        h = [],
        i = d.length,
        j = null,
        k = d.length;
      a.each(d.split(""), function(a, b) {
        b == "?" ? (k--, i = a) : g[b] ? (h.push(new RegExp(g[b])), j == null && (j = h.length - 1)) : h.push(null)
      });
      return this.trigger("unmask").each(function() {
        function v(a) {
          var b = f.val(),
            c = -1;
          for (var d = 0, g = 0; d < k; d++) if (h[d]) {
            l[d] = e.placeholder;
            while (g++ < b.length) {
              var m = b.charAt(g - 1);
              if (h[d].test(m)) {
                l[d] = m, c = d;
                break
              }
            }
            if (g > b.length) break
          } else l[d] == b.charAt(g) && d != i && (g++, c = d);
          if (!a && c + 1 < i) f.val(""), t(0, k);
          else if (a || c + 1 >= i) u(), a || f.val(f.val().substring(0, c + 1));
          return i ? d : j
        }
        function u() {
          return f.val(l.join("")).val()
        }
        function t(a, b) {
          for (var c = a; c < b && c < k; c++) h[c] && (l[c] = e.placeholder)
        }
        function s(a) {
          var b = a.which,
            c = f.caret();
          if (a.ctrlKey || a.altKey || a.metaKey || b < 32) return !0;
          if (b) {
            c.end - c.begin != 0 && (t(c.begin, c.end), p(c.begin, c.end - 1));
            var d = n(c.begin - 1);
            if (d < k) {
              var g = String.fromCharCode(b);
              if (h[d].test(g)) {
                q(d), l[d] = g, u();
                var i = n(d);
                f.caret(i), e.completed && i >= k && e.completed.call(f)
              }
            }
            return !1
          }
        }
        function r(a) {
          var b = a.which;
          if (b == 8 || b == 46 || c && b == 127) {
            var d = f.caret(),
              e = d.begin,
              g = d.end;
            g - e == 0 && (e = b != 46 ? o(e) : g = n(e - 1), g = b == 46 ? n(g) : g), t(e, g), p(e, g - 1);
            return !1
          }
          if (b == 27) {
            f.val(m), f.caret(0, v());
            return !1
          }
        }
        function q(a) {
          for (var b = a, c = e.placeholder; b < k; b++) if (h[b]) {
            var d = n(b),
              f = l[b];
            l[b] = c;
            if (d < k && h[d].test(f)) c = f;
            else break
          }
        }
        function p(a, b) {
          if (!(a < 0)) {
            for (var c = a, d = n(b); c < k; c++) if (h[c]) {
              if (d < k && h[c].test(l[d])) l[c] = l[d], l[d] = e.placeholder;
              else break;
              d = n(d)
            }
            u(), f.caret(Math.max(j, a))
          }
        }
        function o(a) {
          while (--a >= 0 && !h[a]);
          return a
        }
        function n(a) {
          while (++a <= k && !h[a]);
          return a
        }
        var f = a(this),
          l = a.map(d.split(""), function(a, b) {
            if (a != "?") return g[a] ? e.placeholder : a
          }),
          m = f.val();
        f.data(a.mask.dataName, function() {
          return a.map(l, function(a, b) {
            return h[b] && a != e.placeholder ? a : null
          }).join("")
        }), f.attr("readonly") || f.one("unmask", function() {
          f.unbind(".mask").removeData(a.mask.dataName)
        }).bind("focus.mask", function() {
          m = f.val();
          var b = v();
          u();
          var c = function() {
              b == d.length ? f.caret(0, b) : f.caret(b)
            };
          (a.browser.msie ? c : function() {
            setTimeout(c, 0)
          })()
        }).bind("blur.mask", function() {
          v(), f.val() != m && f.change()
        }).bind("keydown.mask", r).bind("keypress.mask", s).bind(b, function() {
          setTimeout(function() {
            f.caret(v(!0))
          }, 0)
        }), v()
      })
    }
  })
})(jQuery);



(function($) {
  $.fn.validationEngineLanguage = function() {};
  $.validationEngineLanguage = {
    newLang: function() {
      $.validationEngineLanguage.allRules =   {"required":{         // Add your regex rules here, you can take telephone as an example
          "regex":"none",
            "alertText":"* Campo obrigatório",
            "alertTextCheckboxMultiple":"* Selecione uma opção",
            "alertTextCheckboxe":"* Campo obrigatório"},
          "length":{
            "regex":"none",
            "alertText":"*Entre ",
            "alertText2":" e ",
            "alertText3": " carateres permitidos"},
          "maxCheckbox":{
            "regex":"none",
            "alertText":"* Foi atingido o máximo número de escolhas"},
          "minCheckbox":{
            "regex":"none",
            "alertText":"* Selecione ",
            "alertText2":" opções"},
          "equals":{
            "regex":"none",
            "alertText":"* Os campos não correspondem"},
          "phone":{
            // credit: jquery.h5validate.js / orefalo
            "regex": /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
            "alertText":"* Número de telefone inválido"},
          "email":{
            // Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
            "regex": /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/,
            "alertText":"* Endereço de email inválido"},
          "integer":{
            "regex": /^[\-\+]?\d+$/,
            "alertText":"* Não é um número inteiro"},
          "number":{
            // Number, including positive, negative, and floating decimal. Credit: bassistance
            "regex": /^[\-\+]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)$/,
            "alertText":"* Não é um número decimal"},
          "date":{
            // Date in ISO format. Credit: bassistance
                         "regex":/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
                         "alertText":"* Data inválida, o formato deve de ser AAAA-MM-DD"},

                    "ipv4":{
                      "regex": /^([1-9][0-9]{0,2})+\.([1-9][0-9]{0,2})+\.([1-9][0-9]{0,2})+\.([1-9][0-9]{0,2})+$/,
                      "alertText":"* Número IP inválido"},
                    "url":{
                      "regex":/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
                      "alertText":"* URL inválido"},
          "onlyNumber":{
            "regex":/^[0-9\ ]+$/,
            "alertText":"* Só é permitido números"},
          "noSpecialCharacters":{
            "regex":/^[0-9a-zA-Z]+$/,
            "alertText":"* Não são permitidos carateres especiais"},
          "ajaxUser":{
            "file":"validateUser.php",
            "extraData":"name=eric",
            "alertTextOk":"* Nome de utilizador disponível",
            "alertTextLoad":"* Em carregamento, aguarde...",
            "alertText":"* Nome de utilizador não disponível"},
          "ajaxName":{
            "file":"validateUser.php",
            "alertText":"* Nome não disponível",
            "alertTextOk":"* Nome disponível",
            "alertTextLoad":"* Em carregamento, aguarde..."},
          "onlyLetter":{
            "regex":/^[a-zA-Z\ \']+$/,
            "alertText":"* Só são permitidas letras"},
          "validate2fields":{
              "nname":"validate2fields",
              "alertText":"* Deve inserir o primeiro e último nome"}
          }

    }
  }
})(jQuery);

$(document).ready(function() {
  $.validationEngineLanguage.newLang()
});