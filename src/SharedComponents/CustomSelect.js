import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

export default class CustomSelect extends React.Component {
  constructor(props) {
    super(props);

    let defaultValue = '';
    if (this.props.defaultValue) {
      ({ defaultValue } = this.props);
    } else if (this.props.defaultValue) {
      defaultValue = [];
    }

    this.state = {
      value: defaultValue,
      valueErr: false,
      offsetTop: 0,
    };

    this.maxOptions = this.props.maxOptions ? this.props.maxOptions : 60;
    this.optionsCounter = 0;
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    this.setState({ offsetTop: ReactDOM.findDOMNode(this).offsetTop });
  }

  handleChange = (value) => {
    if (value && value !== '' && value !== 'null' && Array.isArray(value)) {
      this.setState({ valueErr: false });
      this.setState({ value });
      if (typeof this.props.setValue === 'function') {
        this.props.setValue(value.map((a) => a.value).join(','));
      }
    } else if (value && value !== '' && value !== 'null') {
      this.setState({ valueErr: false });
      this.setState({ value });
      if (typeof this.props.setValue === 'function') {
        this.props.setValue(value.value);
      }
    } else {
      this.setState({ value });
      if (typeof this.props.setValue === 'function') {
        this.props.setValue('');
      }
    }
  };

  setFocus = () => this.selectRef.focus();

  filterValues = (data, value) => {
    let isDisplayed = this.optionsCounter < this.maxOptions;

    if (value && value !== '') {
      const regExp = new RegExp(value, 'i');
      if (!regExp.test(data.label)) isDisplayed = false;
    }

    if (isDisplayed) this.optionsCounter++;
    if (this.optionsCounter === this.props.options.length || this.optionsCounter === this.maxOptions) {
      this.optionsCounter = 0;
    }
    return isDisplayed;
  };

  render() {
    const Component = this.props.isCreatable ? CreatableSelect : Select;
    const selectStyles = {
      input: (base) => ({
        ...base,
        height: '25px',
        fontFamily: 'var(--font-main)',
        marginTop: '-0.75px',
        fontSize: '15px',
        backgroundColor: 'transparent',
      }),
      control: (base, state) => ({
        ...base,
        minHeight: '25px',
        height: 'fit-content',
        fontFamily: 'var(--font-main)',
        fontSize: '15px',
        backgroundColor: 'transparent',
        border: '0px',
        borderRadius: '0px',
        borderBottom: this.state.valueErr
          ? '2px solid'
          : state.selectProps.menuIsOpen
          ? '2px solid'
          : '1px solid',
        borderColor: this.state.valueErr
          ? '#f44336 !important'
          : state.selectProps.menuIsOpen
          ? '#3f51b5 !important'
          : 'rgba(0, 0, 0, 0.42) !important',
        boxShadow: 'none',
        '&:hover': {
          borderBottom: state.selectProps.menuIsOpen ? '2px solid' : '2px solid',
          borderColor: this.state.valueErr
            ? '#f44336'
            : state.selectProps.menuIsOpen
            ? '#3f51b5'
            : 'black',
        },
      }),
      placeholder: (base, state) => ({
        ...base,
        height: '25px',
        fontFamily: 'var(--font-main)',
        fontSize: '15px',
        color: this.state.valueErr ? '#f44336' : state.selectProps.menuIsOpen ? '#3f51b5' : '',
        backgroundColor: 'transparent',
      }),
      option: (base) => ({
        ...base,
        fontFamily: 'var(--font-main)',
        fontSize: '15px',
        marginTop: '-3px',
        color: 'rgba(0, 0, 0, 0.87)',
      }),
      valueContainer: (base) => ({
        ...base,
        minHeight: '24px',
        height: 'fit-content',
        marginTop: '-5px',
        paddingLeft: '0px',
        marginLeft: '-2px',
      }),
      indicatorsContainer: (base) => ({
        ...base,
        minHeight: '25px !important',
        padding: '0px !important',
      }),
      clearIndicator: (base) => ({
        ...base,
        padding: '0px 5px 0px 5px !important',
      }),
      dropdownIndicator: (base) => ({
        ...base,
        padding: '0px 5px 0px 5px !important',
      }),
    };

    return (
      <div style={this.props.style}>
        <Component
          allowCreate={this.props.allowCreate}
          ref={this.selectRef}
          options={this.props.options}
          styles={selectStyles}
          // menuPlacement={this.state.offsetTop < 250 ? "bottom" : "top"}
          menuPlacement={this.props.bottom ? 'bottom' : this.state.offsetTop < 250 ? 'bottom' : 'top'}
          value={this.state.value}
          placeholder={this.props.label}
          defaultValue={this.props.defaultValue}
          defaultInputValue={this.props.defaultInputValue}
          onChange={this.handleChange}
          onMenuOpen={() => {
            this.optionsCounter = 0;
          }}
          noOptionsMessage={() => '?????? ???????????????????? ??????????????????'}
          isClearable
          isSearchable
          required
          isMulti={!!this.props.isMulti}
          style={{ width: '200px' }}
          filterOption={this.filterValues}
        />
      </div>
    );
  }
}
