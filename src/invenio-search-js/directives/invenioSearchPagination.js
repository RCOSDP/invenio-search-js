/*
 * This file is part of Invenio.
 * Copyright (C) 2017-2018 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

/**
  * @ngdoc directive
  * @name invenioSearchPagination
  * @description
  *   The pagination directive for search
  * @namespace invenioSearchPagination
  * @example
  *    Usage:
  *    <invenio-search-pagination
  *     show-go-to-first-last='true'
  *     adjacent-size='4'
  *     template='TEMPLATE_PATH'>
  *        ... Any children directives
  *    </invenio-search-pagination>
  */
function invenioSearchPagination() {
  // Functions

  /**
    * Handle pagination
    * @memberof invenioSearchPagination
    * @param {service} scope -  The scope of this element.
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @param {invenioSearchController} vm - Invenio search controller.
    */
  function link(scope, element, attrs, vm) {
      // Watch when `invenioSearchArgs` changes and fire a new search
    scope.paginatePages = [];
    scope.adjacentSize = attrs.adjacentSize || 4;
    scope.showGoToFirstLast = attrs.showGoToFirstLast || false;

    scope.$watch('vm.invenioSearchArgs.page', function(current, next) {
      if (current !== next) {
        buildPages();
      }
    });

    scope.$watch('vm.invenioSearchResults', function(current, next) {
      buildPages();
    });

    /**
      * Add range number for magination
      * @memberof link
      * @param {int} start - The start of the range.
      * @param {int} finish - The end of the range.
      */
    function addRange(start, finish) {
      // Create the Add Item Function
      var _current = current();

      var buildItem = function (i) {
        return {
          value: i,
          title: 'Go to page ' + i,
        };
      };

      var pagesToBeProcessed = [];
      var lastSetOfPageToBeProcessed = [];

      // Add our items where i is the page number
      for (var i = start; i <= finish; i++) {
        var item = buildItem(i);

        var fivePagesBeforeSearchAfter =
          Math.floor(attrs.maxResultWindow / vm.invenioSearchArgs.size) - 5;
        var currentPageBeingDisplayed = vm.invenioSearchArgs.page;
        var lastPageBeforeSearchAfter = fivePagesBeforeSearchAfter + 5;

        if (i <= lastPageBeforeSearchAfter) {
          if (finish - i <= 10) {
            lastSetOfPageToBeProcessed.push(item);
            if (i + 1 === finish) {
              pagesToBeDisplayed.push(lastSetOfPageToBeProcessed);
            }
          } else if (pagesToBeProcessed.length === 10) {
            pagesToBeDisplayed.push(pagesToBeProcessed);
            pagesToBeProcessed = [];
          } else {
            pagesToBeProcessed.push(item);
          }
        }

        if (fivePagesBeforeSearchAfter <= currentPageBeingDisplayed) {
          if (currentPageBeingDisplayed <= lastPageBeforeSearchAfter) {
            pagesToBeDisplayed = [];
            pagesToBeProcessed = [];
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 9));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 8));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 7));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 6));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 5));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 4));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 3));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 2));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter - 1));
            pagesToBeProcessed.push(buildItem(lastPageBeforeSearchAfter));
            pagesToBeDisplayed.push(pagesToBeProcessed);
          }
        }

        if (currentPageBeingDisplayed > lastPageBeforeSearchAfter) {
          pagesToBeDisplayed = [];
          pagesToBeProcessed = [];
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 9));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 8));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 7));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 6));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 5));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 4));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 3));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 2));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed - 1));
          pagesToBeProcessed.push(buildItem(currentPageBeingDisplayed));
          pagesToBeDisplayed.push(pagesToBeProcessed);
        }
      }

      pagesToBeDisplayed.forEach((item) => {
        const pageArray = Object.values(item);
        const pageItemObject = pageArray.map((pageItem) => {
          return pageItem["value"];
        });

        if (pageItemObject.includes(start)) {
          item.forEach((page) => {
            if (page.value <= lastPageBeforeSearchAfter) {
              scope.paginatePages.push(page);
            } else {
              if (page.value <= currentPageBeingDisplayed) {
                scope.paginatePages.push(page);
              }
            }
          });
        }
      });
    }

    /**
      * Calculate the numbers
      * @memberof link
      */
    function buildPages() {
      // Reset pages
      scope.paginatePages = [];
      // How many neighbours to show before and after the current page
      var adjacent = scope.adjacentSize;
      // Get total pages based on the results shown by page
      var pageCount = total();
      // Get the current page
      var _current = current();
      // Display the adjacent a1 a2 a3 + current + a5 a6 a7
      var adjacentSize = 2 * adjacent + 1;

      // Pages to show in the pagination
      var start, finish;
      // Simply display all the pages
      if (pageCount <= (adjacentSize + 2)) {
        start = 1;
        addRange(start, pageCount);
      } else {
        if (_current - adjacent <= 2) {
          start = 1;
          finish = 1 + adjacentSize;
          addRange(start, finish);
        } else if (_current < pageCount - (adjacent + 2)) {
          start = _current - adjacent;
          finish = _current + adjacent;
          addRange(start, finish);
        } else {
          start = _current - adjacent;
          if (_current <= pageCount - 5) {
            finish = _current + adjacent;
          } else {
            finish = pageCount;
          }
          addRange(start, finish);
        }
      }
    }

    /**
      * Calculate the total pages
      * @memberof link
      */
    function total() {
      var _total;
      try {
        _total = vm.invenioSearchResults.hits.total;
      } catch (error) {
        _total = 0;
      }
      return Math.ceil(_total/vm.invenioSearchArgs.size);
    }

    /**
      * Calculate the current page
      * @memberof link
      */
    function current() {
      return parseInt(vm.invenioSearchArgs.page) || 1;
    }

    /**
      * Calculate the next page
      * @memberof link
      */
    function next() {
      var _next = current();
      var _total = total();
      if (_next < _total) {
        _next = _next + 1;
      }
      return _next;
    }

    /**
      * Calculate the previous page
      * @memberof link
      */
    function previous() {
      var _previous = current();
      var _total = total();
      if (_previous > 1) {
        _previous = _previous - 1;
      }
      return _previous;
    }

    /**
      * Calculate page class if it is active or not
      * @memberof link
      * @param {int} index - A given page of the array.
      */
    function getPageClass(index) {
      return index === current() ? 'active' : '';
    }

    /**
      * Calculate the next arrow if it is active or not
      * @memberof link
      */
    function getNextClass() {
      return current() < total() ? '' : 'disabled';
    }

    /**
      * Calculate the previous arrow if it is active or not
      * @memberof link
      */
    function getPrevClass() {
      return current() > 1 ? '' : 'disabled';
    }

    /**
      * Calculate the go to first if it is active or not
      * @memberof link
      */
    function getFirstClass() {
      return current() !== 1 ? '' : 'disabled';
    }

    /**
      * Calculate the go to last if it is active or not
      * @memberof link
      */
    function getLastClass() {
      return current() <
        Math.floor(attrs.maxResultWindow / vm.invenioSearchArgs.size)
        ? ""
        : "disabled";
      /*return current() !== total() ? '' : 'disabled';*/
    }

    /**
      * Change page to the given index
      * @memberof link
      * @param {int} index - A given page of the array.
      */
    function changePage(index) {
      if (index > total()) {
        vm.invenioSearchArgs.page = total();
      } else if (index < 1) {
        vm.invenioSearchArgs.page = 1;
      } else if (index == "page_before_search_after") {
        vm.invenioSearchArgs.page = Math.floor(
          attrs.maxResultWindow / vm.invenioSearchArgs.size
        );
      } else {
        vm.invenioSearchArgs.page = index;
      }
    }

    // Pages calculator
    scope.paginationHelper = {
      changePage: changePage,
      current: current,
      getFirstClass: getFirstClass,
      getLastClass: getLastClass,
      getNextClass: getNextClass,
      getPageClass: getPageClass,
      getPrevClass: getPrevClass,
      next: next,
      pages: buildPages,
      previous: previous,
      total: total,
    };
  }

  /**
    * Choose template for pagination
    * @memberof invenioSearchPagination
    * @param {service} element - Element that this direcive is assigned to.
    * @param {service} attrs - Attribute of this element.
    * @example
    *    Minimal template `template.html` usage
    *      <ul class="pagination" ng-if="vm.invenioSearchResults.hits.total">
    *        <li ng-class="paginationHelper.getPageClass(page.value)"
    *            ng-repeat="page in paginatePages">
    *          <a href="#" ng-click="paginationHelper.changePage(page.value)"
    *             alt="{{ page.title }}">{{ page.value }}</a>
    *        </li>
    *      </ul>
    */
  function templateUrl(element, attrs) {
    return attrs.template;
  }

  ////////////

  return {
    restrict: 'AE',
    scope: false,
    require: '^invenioSearch',
    templateUrl: templateUrl,
    link: link,
  };

}

angular.module('invenioSearch.directives')
  .directive('invenioSearchPagination', invenioSearchPagination);
