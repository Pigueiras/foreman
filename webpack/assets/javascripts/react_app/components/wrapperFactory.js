import React from 'react';
import { Provider } from 'react-redux';
import { i18nProviderWrapperFactory } from '../common/i18nProviderWrapperFactory';
import { getDisplayName } from '../common/helpers';

const storeProviderWrapperFactory = store =>
  (WrappedComponent) => {
    class StoreProvider extends React.Component {
      render() {
        return (
          <Provider store={store}>
            <WrappedComponent {...this.props} />
          </Provider>
        );
      }
    }
    StoreProvider.displayName = `StoreProvider(${getDisplayName(WrappedComponent)})`;

    return StoreProvider;
  };

const dataProviderWrapperFactory = (data, flattenData = false) =>
  (WrappedComponent) => {
    class DataProvider extends React.Component {
      render() {
        if (flattenData) {
          return (
            <WrappedComponent {...data} {...this.props} />
          );
        }
        return (
          <WrappedComponent data={data} {...this.props} />
        );
      }
    }
    DataProvider.displayName = `DataProvider(${getDisplayName(WrappedComponent)})`;

    return DataProvider;
  };

const propDataMapperWrapperFactory = () =>
  (WrappedComponent) => {
    class PropDataMapper extends React.Component {
      render() {
        return (
          <WrappedComponent data={this.props} />
        );
      }
    }
    PropDataMapper.displayName = `PropDataMapper(${getDisplayName(WrappedComponent)})`;

    return PropDataMapper;
  };

export const wrapperRegistry = {
  wrappers: {
    data: dataProviderWrapperFactory,
    dataMapper: propDataMapperWrapperFactory,
    store: storeProviderWrapperFactory,
    i18n: i18nProviderWrapperFactory,
  },
  register(name, wrapper) {
    if (this.wrappers[name]) {
      throw new Error(`Wrapper name already taken: ${name}`);
    }

    this.wrappers[name] = wrapper;
  },
  getWrapper(name) {
    if (!this.wrappers[name]) {
      throw new Error(`Wrapper not found: ${name}`);
    }

    return this.wrappers[name];
  },
};

export class WrapperFactory {
  constructor() {
    this.wrapper = component => component;
  }

  with(name, ...params) {
    const currentWrapper = this.wrapper;
    const additionalWrapperFactory = wrapperRegistry.getWrapper(name);
    const additionalWrapper = additionalWrapperFactory(...params);

    this.wrapper = component => additionalWrapper(currentWrapper(component));

    return this;
  }
}
