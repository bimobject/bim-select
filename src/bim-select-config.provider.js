exports.name = 'bimSelectConfig';

const config = {
    diacritics: null,
    itemTemplateUrl: null,
    placeholder: null,
    sorter: null
};

/**
 * @ngdoc provider
 * @name bimSelectConfigProvider
 * @description
 * Use bimSelectConfigProvider to be able to reuse a set of configuration
 * options for all instances of `bimSelect` in an application.
 *
 * @example
 * const randomSorter = () => 2 * Math.random() - 1;
 *
 * angular.module('app').config(function(bimSelectConfigProvider) {
 *     bimSelectConfigProvider.set('sorter', randomSorter);
 * });
 */
exports.impl = class bimSelectConfigProvider {
    /**
     * @ngdoc method
     * @name bimSelectConfigProvider.set
     * @description
     * Set global default values for these options:
     *
     * - `placeholder`: Must be a string.
     * - `sorter`: Must be a function.
     * - `itemTemplateUrl`: Must be a string.
     * - `diacritics`: Must be a string.
     *
     * For details on the values, see the documentation for `bimSelect`.
     * @param {String} option
     *   The name of the option to set.
     * @param {Any} value
     *   The value for the option.
     */
    set(option, value) {
        if (!Object.keys(config).includes(option)) {
            throw new Error(`Invalid configuration name: ${option}`);
        }

        switch (option) {
            case 'sorter':
                if (value === null || typeof value === 'function') {
                    config[option] = value;
                } else {
                    throw new Error('The sorter value must be a function');
                }
                break;

            case 'placeholder':
                if (value === null || typeof value === 'string') {
                    config[option] = value;
                } else {
                    throw new Error('The placeholder value must be a string');
                }
                break;

            case 'diacritics':
                if (value === null || typeof value === 'string') {
                    config[option] = value;
                } else {
                    throw new Error('The diacritics value must be a string');
                }
                break;

            case 'itemTemplateUrl':
                if (value === null || typeof value === 'string') {
                    config[option] = value;
                } else {
                    throw new Error('The itemTemplateUrl value must be a string');
                }
                break;
        }
    }

    $get() {
        return Object.freeze(Object.assign({}, config));
    }
};
