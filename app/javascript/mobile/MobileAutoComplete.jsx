import React from 'react';
import PropTypes from 'prop-types';
import {
  Input, List,
} from 'antd-mobile/2x';
import 'antd-mobile/2x/es/global';

class MobileAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: false,
      search: props.value,
    };
  }

  render() {
    const {
      onChange, onFocus, onSearch, options, filterOption, placeholder,
    } = this.props;
    const { showOptions, search } = this.state;
    const safeSearch = search == null ? '' : search;
    const filteredOptions = options.filter((option) => filterOption(safeSearch, option));
    return (
      <div>
        <Input
          value={search || undefined}
          placeholder={placeholder}
          onFocus={(event) => {
            onFocus(event);
            this.setState({ showOptions: true });
          }}
          onBlur={(event) => {
            setTimeout(() => {
              const { onBlur, value } = this.props;
              this.setState({
                showOptions: false,
                search: value,
              });
              onBlur(event);
            }, 200);
          }}
          onChange={(newValue) => {
            this.setState({ search: newValue });
            onChange(newValue);
            onSearch(newValue);
          }}
        />
        <List
          style={{
            display: showOptions ? 'block' : 'none',
            position: 'absolute',
            zIndex: 99,
          }}
        >
          { filteredOptions.map((option) => (
            <List.Item
              onClick={() => {
                onChange(option.value);
              }}
              key={option.value}
            >
              { option.value }
            </List.Item>
          ))}
        </List>
      </div>
    );
  }
}
MobileAutoComplete.propTypes = {
  filterOption: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onSearch: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape()),
  placeholder: PropTypes.string,
  value: PropTypes.string,
};
MobileAutoComplete.defaultProps = {
  filterOption: () => true,
  onBlur: () => {},
  onChange: () => {},
  onFocus: () => {},
  onSearch: () => {},
  options: [],
  placeholder: undefined,
  value: undefined,
};

export default MobileAutoComplete;
