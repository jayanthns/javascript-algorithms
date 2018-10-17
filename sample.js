
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OButton from '../../Shared/Shared-Components/AddButton/Button';
import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Filter from '../../Shared/Shared-Components/Filter';
import DataTable from '../../Shared/Shared-Components/DataTable';
import Dialog from '../../Shared/Shared-Components/Dialog';
// import AutoComplete from '../../Shared/Shared-Components/AutoComplete';
// import DropDown from '../../Shared/Shared-Components/DropDown';
import { FontAwesomeCloseIconSC } from '../VDN-Override/VDNOverridesStyle';
import styled from 'styled-components';
import { getDnisInfo, saveDnisInfo } from './actions';

import * as StyledComponents from '../Rule-Administration/styles';

import 'react-dropdown/style.css';
import { faTimes } from 'fa5-pro-solids';

export const Heading = styled.p`
color:#2e4053;
font-weight: bold
font-size: 18px;
margin-bottom: -12px;
font-family: sans-serif;
`;

export const Required = styled.span`
color: red;
font-size: 25px;
`;
export const RequiredMessage = styled.span`
color: red;
font-size: 16px;
padding-left:25px
`;

const theme = createMuiTheme({
  overrides: {
    MuiSelect: {
      root: {
        maxWidth: '289px'
      }
    }
  }
});

const styles = theme => ({
  layout: {},
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'left',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 6,
      marginBottom: theme.spacing.unit * 6,
      padding: theme.spacing.unit * 3
    }
  },
  label: {
    color: '#3f51b5',
    float: 'left',
    marginLeft: '22px',
    marginBottom: '-16px',
    fontSize: '15px',
    fontFamily: 'sans-serif'
  },
  control: {
    marginLeft: '22px'
  },
  dropdown: {
    width: '200px'
  },
  toogleBtn: {
    textTransform: 'capitalize'
  },
  callerTypeContainer: {
    width: '192px'
  },
  heading: {
    marginTop: '0px',
    marginBottom: '-10px'
  },
  searchBtn: {
    float: 'right',
    backgroundColor: '#00bcd4',
    marginRight: '20px'
  },
  headingColor: {
    color: ' #344457'
  },
  whiteFont: {
    color: '#fff'
  },
  dot: {
    width: '5px',
    marginBottom: '2.5px',
    height: '5px',
    backgroundColor: 'grey',
    borderRadius: '50%',
    display: 'inline-block'
  }
});

class DnisInfo extends Component {
  constructor (props) {
    super(props);
    this.state = {
      originalData: null,
      data: null,
      isFilterVisible: false,
      filterCriteriaList: null,
      selectedFilteredCriteriaList: null,
      currentEditIndexValue: -1,
      editRow: null,
      dialog: null,
      isPinEnabled: false,
      dnisId: '',
      dnisWelcomeId: '',
      dnisCacr: '',
      defaultCallerType: '',
      area: '',
      subArea: '',
      callerType: '',
      notes: '',
      isAddVisible: false,
      sortType: 'asc',
      activityCategory: '',
      activityType: '',
      isValidForm: true
    };
  }

  UNSAFE_componentWillMount () {
    this.props
      .getDnisInfo()
      .then(() => {
        this.onreset();
      })
      .catch(error => {}) //eslint-disable-line
  }

  getHeaders (headers) {
    return headers.map(item => {
      return Object.assign({}, item, { isVisible: true });
    });
  }

  getRows (getRows) {
    return getRows.map(item => {
      return item.map(colItem => {
        return Object.assign({}, colItem, { isVisible: true });
      });
    });
  }

  onreset () {
    let _selectedFilters = this.props.filterArray.map(obj => {
      return { key: obj.key };
    });
    this.setState({
      data: Object.assign(
        {},
        {
          headers: this.getHeaders(this.props.data.headers),
          rows: this.getRows(this.props.data.rows)
        }
      ),
      originalData: Object.assign(
        {},
        {
          headers: this.getHeaders(this.props.data.headers),
          rows: this.getRows(this.props.data.rows)
        }
      ),

      selectedFilteredCriteriaList: _selectedFilters,
      filterCriteriaList: this.props.filterArray
    });
  }

  getSortDropDown () {
    return (
      <Select
        value={this.state.sortType}
        onChange={event =>
          this.handleSortChange('sortType', event.target.value)}
        inputProps={{
          id: 'ddlSortType'
        }}
      >
        <MenuItem value={'asc'}>
          Alpha (A-Z)
        </MenuItem>
        <MenuItem value={'desc'}>
          Alpha (Z-A)
        </MenuItem>
      </Select>
    );
  }

  handleSortChange (name, value) {
    this.setState({
      [name]: value
    });
    let _data = Object.assign({}, this.state.originalData);
    let headers = Object.assign([], _data.headers);
    let rows = Object.assign([], _data.rows);
    if (value === 'asc') {
      rows = rows.sort((a, b) => {
        if (a[0].value.toLowerCase() < b[0].value.toLowerCase()) return -1;
        if (a[0].value.toLowerCase() > b[0].value.toLowerCase()) return 1;
        return 0;
      });
      this.setState({
        data: Object.assign({}, this.state.data, { headers, rows })
      });
    } else {
      rows = rows.sort((a, b) => {
        if (a[0].value.toLowerCase() > b[0].value.toLowerCase()) return -1;
        if (a[0].value.toLowerCase() < b[0].value.toLowerCase()) return 1;
        return 0;
      });
      this.setState({
        data: Object.assign({}, this.state.data, { headers, rows })
      });
    }
  }

  constructFilterComponent (filterList) {
    let _domList = [];
    let _dom = { header: null, options: null, sort: null };
    _dom.header = 'Coverage Type';

    if (_.size(filterList) > 0) {
      _dom.options = filterList.map((item, index) => {
        return (
          <StyledComponents.CheckboxItem key={'filterKeyItem' + index}>
            <StyledComponents.CheckboxSC
              checked={_.some(this.state.selectedFilteredCriteriaList, [
                'key',
                item.key
              ])}
              value={_.toString(item.key)}
              color='primary'
              onChange={this.handleChange.bind(this, item.key)}
            />
            <span style={{ fontSize: 14, color: '#86919d' }}>
              {_.toString(item.value)}
            </span>
            <div style={{ marginLeft: 30 }}>
              {item &&
                item.subList &&
                _.size(item.subList) > 0 &&
                item.subList.map((subItem, index) => {
                  return (
                    <StyledComponents.CheckboxGroupItem
                      key={'filterKeySubItem' + index}
                    >
                      <StyledComponents.CheckboxSC
                        checked={_.some(
                          this.state.selectedFilteredCriteriaList,
                          ['key', subItem.key]
                        )}
                        value={_.toString(subItem.key)}
                        color='primary'
                        onChange={this.handleChange.bind(this, subItem.key)}
                      />
                      <span style={{ fontSize: 12, color: '#86919d' }}>
                        {_.toString(subItem.value)}
                      </span>
                    </StyledComponents.CheckboxGroupItem>
                  );
                })}
            </div>
          </StyledComponents.CheckboxItem>
        );
      });
    }
    _domList.push(_dom);
    return _domList;
  }

  constructRowsByColType (rows) {
    let _rows = Object.assign([], rows);
    let _dom = [];
    _.size(_rows) > 0 &&
      _rows.forEach(element => {
        let _cols = [];
        element.forEach(col => {
          if (col.isVisible) {
            let _domObj = typeof col.value === 'boolean'
              ? col.value ? 'Yes' : 'No'
              : col.value;
            _cols.push(_domObj);
          }
        });
        _dom.push(_cols);
      });
    return _dom;
  }

  setCriteriaList (headers) {
    let _selectedList = [];
    _.size(headers) > 0 &&
      headers.forEach(item => {
        if (!_.some(_selectedList, ['key', item.key])) {
          _selectedList.push({ key: item.key });
        } else {
          _.remove(_selectedList, ['key', selectedFilter]) //eslint-disable-line
        }
      });
    return _.uniqWith(_selectedList, ['key']);
  }

  toggleDrawer () {
    if (!this.state.isPinEnabled) {
      this.setState({
        isFilterVisible: !this.state.isFilterVisible,
        isAddVisible: false
      });
    }
  }

  toggleAdd () {
    if (!this.state.isPinEnabled) {
      this.setState({
        isAddVisible: true,
        isFilterVisible: false
      });
    }
  }

  closeAdd () {
    this.setState({
      isAddVisible: false,
      isFilterVisible: false
    });
  }

  handleChange (selectedFilter) {
    let selectedFilteredCriteriaList = Object.assign(
      [],
      this.state.selectedFilteredCriteriaList
    );
    let _data = Object.assign({}, this.state.originalData);
    let headers = Object.assign([], _data.headers);
    let rows = Object.assign([], _data.rows);
    if (_.some(selectedFilteredCriteriaList, ['key', selectedFilter])) {
      _.remove(selectedFilteredCriteriaList, ['key', selectedFilter]);
      rows = rows.filter(row => {
        var l =
          selectedFilteredCriteriaList.filter(o => o.key === row[4].value)
            .length > 0;
        return l;
      });
    } else {
      selectedFilteredCriteriaList.push({ key: selectedFilter });
      rows = rows.filter(row => {
        return (
          selectedFilteredCriteriaList.filter(o => o.key == row[4].value)
            .length > 0
        );
      });
    }
    this.setState({
      currentEditIndexValue: -1,
      editRow: null,
      selectedFilteredCriteriaList,
      data: Object.assign({}, this.state.data, { headers, rows })
    });
  }

  onDataChange (data) {
    if (this.state.data) {
      let index = this.state.currentEditIndexValue;
      let _data = Object.assign({}, this.state.data);
      let headers = Object.assign([], _data.headers);
      let rows = Object.assign([], _data.rows);
      rows[index][1].value = data;
      this.setState({ data: Object.assign({}, data, { rows, headers }) });
    }
  }

  getComponentByKey (item, index, colIndex) {
    let { col, key, value } = item;
    switch (col) {
      // case 2:
      //   return (
      //     <Fragment>
      //       <AutoComplete
      //         id={_.toString(index + '.' + col)}
      //         selectedValue={value}
      //         onDataChange={this.onDataChange.bind(this)}
      //         // suggestions={suggestions}
      //       />
      //       <DropDown
      //         selectedValue={value}
      //        // suggestions={suggestions}
      //         onDataChange={this.onDataChange.bind(this)}
      //       />
      //     </Fragment>
      //   );
      case 2:
        return (
          <StyledComponents.TextFieldSC
            id={_.toString(index + '.' + col)}
            name={'txtField.' + index + '.' + colIndex + '.' + key}
            defaultValue={value}
          />
        );
      case 3:
        return (
          <StyledComponents.TextFieldSC
            id={_.toString(index + '.' + col)}
            name={'txtField.' + index + '.' + colIndex + '.' + key}
            defaultValue={value}
          />
        );
      case 4:
        return (
          <StyledComponents.TextFieldSC
            id={_.toString(index + '.' + col)}
            name={'txtField.' + index + '.' + colIndex + '.' + key}
            defaultValue={value}
          />
        );
      case 5:
        return (
          <StyledComponents.TextFieldSC
            id={_.toString(index + '.' + col)}
            name={'txtField.' + index + '.' + colIndex + '.' + key}
            defaultValue={value}
          />
        );
      case 6:
        return (
          <StyledComponents.TextFieldSC
            id={_.toString(index + '.' + col)}
            name={'txtField.' + index + '.' + colIndex + '.' + key}
            defaultValue={value}
          />
        );
      // case 5:
      //   return (
      //     <StyledComponents.TextFieldSC

      //       id={_.toString(index + '.' + col)}
      //       name={'txtField.' + index + '.' + colIndex + '.' + key}
      //       defaultValue={value}
      //     />
      //   );
      // case 6:
      //   return (
      //     <div>
      //       <StyledComponents.ToggleTextSC>No</StyledComponents.ToggleTextSC>
      //       {
      //         <StyledComponents.SwitchSC
      //           className={'toggle'}
      //           id={index + '.' + col}
      //           defaultChecked={value}
      //         />
      //       }
      //       <StyledComponents.ToggleTextSC>Yes</StyledComponents.ToggleTextSC>
      //     </div>
      //   );
      default:
        return _.toString(item.value);
    }
  }

  toggleEditRow () {
    this.setState({ currentEditIndexValue: -1, editRow: null });
  }

  constructEditRow () {
    if (this.state.data) {
      let index = this.state.currentEditIndexValue;
      let _editableRow = this.state.data.rows[index];
      let _dom = [];
      _.size(_editableRow) > 0 &&
        _editableRow.forEach((item, colIndex) => {
          if (item.isVisible) {
            _dom.push(
              <StyledComponents.EditColCellSC {colIndex == 0 || colIndex == 1 ? disabled: ""}>
                {this.getComponentByKey(item, index, colIndex)}
              </StyledComponents.EditColCellSC>
            );
          }
        });
      _dom.push(
        <StyledComponents.EditColCellSC
          id={'OTableBodyEditColActionItems.' + index}
          key={'OTableBodyEditColActionItems.' + index}
        >
          <StyledComponents.DeleteIconSC
            id={'OTableDeleteIconSC.' + index}
            onClick={this.onDeleteClick.bind(this, index)}
            color='error'
          />
          <StyledComponents.SaveIconSC
            id={'OTableSaveIconSC.' + index}
            onClick={this.onSaveClick.bind(this, index)}
          />
          <StyledComponents.DeleteIconTextSC
            id={'OTableDeleteIconTextSC.' + index}
          >
            Delete
          </StyledComponents.DeleteIconTextSC>
          <StyledComponents.SaveIconTextSC id={'OTableSaveIconTextSC.' + index}>
            Save
          </StyledComponents.SaveIconTextSC>
          <StyledComponents.ButtonCancelSC
            id={'OTableButtonCancelSC.' + index}
            onClick={this.toggleEditRow.bind(this, index)}
          >
            Cancel
          </StyledComponents.ButtonCancelSC>
        </StyledComponents.EditColCellSC>
      );
      return _dom;
    }
  }

  onDeleteClick (index) {
    let _row = this.state.data.rows[index];
    const { currentEditIndexValue } = this.state;
    const _rule = _.find(_row, ['col', 1]).value;
    const _cacr_id = _.find(_row, ['col', 2]).value;
    const title = 'contactrouting-stga.bcbsfi.com says';
    const content = `Are you sure you want to delete Rule[${_rule}] with CACR ID [${_cacr_id}]?`;
    this.setState({
      dialog: {
        isOpen: true,
        title,
        content,
        selectedRowForDelete: currentEditIndexValue
      }
    });
  }

  onEditRowClick (index) {
    if (index !== -1) {
      this.setState({
        currentEditIndexValue: index,
        editRow: this.state.data.rows[index],
        isFilterVisible: false,
        isPinEnabled: false
      });
    } else {
      this.setState({
        currentEditIndexValue: index,
        editRow: null,
        isFilterVisible: false,
        isPinEnabled: false
      });
    }
  }

  onSaveClick (index) {
    let lob = document.getElementById(index + '.' + 4);
    let groupDivisionId = document.getElementById(index + '.' + 5);
    let exchange = document.getElementById(index + '.' + 6);
    let cacr = document.getElementsByName('txtCACRId');
    if (lob && groupDivisionId && exchange && cacr) {
      if (_.isEmpty(lob.value) || _.isEmpty(groupDivisionId.value)) {
        alert('Invalida Data');
      } else {
        let rows = _.assign([], this.state.data.rows);
        let _row = rows[index];
        _.find(_row, ['col', 4]).value = lob.value;
        _.find(_row, ['col', 5]).value = groupDivisionId.value;
        _.find(_row, ['col', 6]).value = exchange.checked;
        _.find(_row, ['col', 2]).value = cacr[0].value;
        this.setState({
          currentEditIndexValue: -1,
          editRow: null,
          data: Object.assign({}, this.state.data, { rows })
        });
      }
    }
  }

  handleClose () {
    this.setState({ dialog: null, currentEditIndexValue: -1, editRow: null });
  }

  handleSuccess (index) {
    let rows = _.assign([], this.state.data.rows);
    _.pullAt(rows, index);
    this.setState({
      currentEditIndexValue: -1,
      editRow: null,
      dialog: null,
      data: _.assign({}, this.state.data, { rows })
    });
  }

  onClose () {
    if (!this.state.isPinEnabled) {
      this.setState({ isFilterVisible: false, isPinEnabled: false });
    }
  }

  onPinClick () {
    this.setState({ isPinEnabled: !this.state.isPinEnabled });
  }

  onResetClick () {
    this.onreset();
  }

  onSearch (searchValue) {
    let _data = Object.assign({}, this.state.originalData);
    if (!_.isEmpty(searchValue)) {
      let headers = Object.assign([], _data.headers);
      let rows = Object.assign([], _data.rows);
      rows = rows.filter(row => {
        return (
          row.filter(o =>
            _.includes(o.value.toLowerCase(), searchValue.toLowerCase())
          ).length > 0
        );
      });
      this.setState({
        data: Object.assign({}, this.state.data, { headers, rows })
      });
    } else {
      this.setState({ data: _data });
    }
  }

  handleStateChange (name, value) {
    this.setState({
      [name]: value
    });
  }
  //

  validationCheck () {
    if (this.state.dnisId == '' || this.state.dnisWelcomeId == '' || this.state.defaultCallerType 
      || this.state.dnisCacr == '' ) {
      this.setState({ isValidForm: false});
      return false;
    } else {
      this.setState({ isValidForm: true});
      return true;
    }
  }
  onSubmitClick () {
    if (this.validationCheck()) {
      const data = {
        dnisId: this.state.dnisId,
        routingTag: this.state.dnisWelcomeId,
        notes: this.state.notes,
        LSUP: new Date(),
        userID: 'tq1',
        area: this.state.area,
        subArea: this.state.subArea,
        coverageTag: this.state.callerType,
        activityCategory: this.state.activityCategory,
        activityType: this.state.activityType,
        dnisId: this.state.dnisId,
        dnisCacr: this.state.dnisCacr,
        dnisWelcomeId: this.state.dnisWelcomeId,
        defaultCallerType: this.state.defaultCallerType,
      };
      this.setState({ isAddVisible: false });
      this.resetForm();
      this.props.saveDnisInfo(data);
    }
  }

  resetForm () {
    const data = {
      dnisId:'' ,
      routingTag:'',
      notes:'' ,
      LSUP:'',
      userID: '',
      area:'' ,
      subArea: '',
      coverageTag:'' ,
      activityCategory:'' ,
      activityType: '',
      dnisId: '',
      dnisWelcomeId: '',
      dnisCacr: '',
      defaultCallerType: '',
    };
    this.setState({ ...data });
  }

  render () {
    let data = null;
    if (!this.props.isTableDataLoading && this.state.data) {
      data = {
        headers: Object.assign([], this.state.data.headers),
        rows: Object.assign(
          [],
          this.constructRowsByColType(this.state.data.rows)
        )
      };
    }
    const gridTableStyle = this.state.isFilterVisible
      ? { marginLeft: '0px', marginRight: '34px' }
      : { marginLeft: '162px' };
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <main className={classes.layout}>
          <Fragment>
            <StyledComponents.RowSC>
              <Grid item xs={12} sm={12}>
                <div style={{ marginTop: '-35px', marginRight: '9px' }}>
                  <span style={{ float: 'right' }}>
                    <OButton
                      variant='contained'
                      text='Add Caller Intent'
                      type='default'
                      onButtonClick={this.toggleAdd.bind(this, true)}
                    />
                  </span>
                </div>
              </Grid>
            </StyledComponents.RowSC>

            {this.state.dialog &&
              this.state.dialog.isOpen &
                (
                  <Dialog
                    id='dialogBox'
                    data={this.state.dialog}
                    handleSuccess={this.handleSuccess.bind(this)}
                    handleClose={this.handleClose.bind(this)}
                  />
                )}
            <StyledComponents.RowSC>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={24}>

                  {!this.state.isFilterVisible &&
                    <StyledComponents.FilterButtonSC
                      onClick={this.toggleDrawer.bind(this)}
                    >
                      <StyledComponents.SpacerSC>
                        Show Filter
                      </StyledComponents.SpacerSC>
                      <StyledComponents.SpacerSC>
                        <StyledComponents.FontAwesomeIconSC icon='filter' />
                      </StyledComponents.SpacerSC>
                    </StyledComponents.FilterButtonSC>}
                  {this.state.filterCriteriaList &&
                    this.state.isFilterVisible &&
                    _.size(this.state.filterCriteriaList) > 0 &&
                    <Grid item xs={3} sm={3}>
                      <div
                        style={{ paddingLeft: '30px', paddingRight: '40px' }}
                        md={3}
                      >
                        <Filter
                          isPinEnabled={this.state.isPinEnabled}
                          data={this.constructFilterComponent(
                            this.state.filterCriteriaList
                          )}
                          sortData={this.getSortDropDown()}
                          isSearch
                          onPinClick={this.onPinClick.bind(this)}
                          onClose={this.onClose.bind(this)}
                          onResetClick={this.onResetClick.bind(this)}
                          onSearch={this.onSearch.bind(this)}
                        />
                        <StyledComponents.HideFilterButtonSC
                          onClick={this.toggleDrawer.bind(this)}
                        >
                          <StyledComponents.SpacerSC>
                            Hide  Filter
                          </StyledComponents.SpacerSC>
                          <StyledComponents.SpacerSC>
                            <StyledComponents.FontAwesomeIconSC icon='filter' />
                          </StyledComponents.SpacerSC>
                        </StyledComponents.HideFilterButtonSC>
                      </div>
                    </Grid>}

                  {this.props.isTableDataLoading &&
                    <Grid item xs={9} sm={9}>
                      <StyledComponents.CircularProgressSC id='circularProgress' />
                    </Grid>}
                  {!this.props.isTableDataLoading &&
                    <Grid item xs={9} sm={9}>
                      <div style={gridTableStyle}>
                        <DataTable
                          editRow={this.constructEditRow()}
                          currentEditIndexValue={
                            this.state.currentEditIndexValue
                          }
                          data={data}
                          isEditable
                          onEditRowClick={this.onEditRowClick.bind(this)}
                        />
                      </div>
                    </Grid>}
                  {this.state.isAddVisible &&
                    <Grid item xs={3} sm={3}>
                      <div
                        style={{
                          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                          borderTop: '5px solid #3f51b5',
                          minHeight: '300px',
                          width: '338px'
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            borderBottom: '1px  solid lightgray',
                            padding: '15px',
                            color: '#3f51b5',
                            fontWeight: 'bolder',
                            margin: '0px 0px'
                          }}
                        >
                          New Caller Intent
                          <span style={{ float: 'right' }}>
                            <FontAwesomeCloseIconSC
                              onClick={this.closeAdd.bind(this)}
                              icon={faTimes}
                            />
                          </span>
                        </div>
                        <div
                          style={{ backgroundColor: 'white', height: '800px' }}
                        >
                          <Grid item xs={12} sm={12}>
                            <Grid container spacing={24}>
                              <Grid item xs={12} sm={12}>
                                <label className={classes.label}>
                                DNIS <Required>*</Required>
                                </label>
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <div className={classes.control}>
                                  <TextField
                                    id='txtdnisId'
                                    name='txtdnisId'
                                    placeholder='alphabet_soup'
                                    value={this.state.dnisId}
                                    onChange={event =>
                                      this.handleStateChange(
                                        'dnisId',
                                        event.target.value
                                      )}
                                    // onInput={e => {
                                    //   e.target.value = e.target.value.replace(
                                    //     /[^0A-Za-z]/g,
                                    //     ''
                                    //   );
                                    // }}
                                    inputProps={{
                                      maxLength: 200
                                    }}
                                  />
                                </div>
                              </Grid>

                              <Grid item xs={12} sm={12}>
                                <label className={classes.label}>
                                WELCOME MESSAGE <Required>*</Required>
                                </label>
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <div className={classes.control}>
                                  <TextField
                                    id='txtdnisWelcomeId'
                                    name='txtdnisWelcomeId'
                                    placeholder='alphabet_soup'
                                    value={this.state.dnisWelcomeId}
                                    onChange={event =>
                                      this.handleStateChange(
                                        'dnisWelcomeId',
                                        event.target.value
                                      )}
                                    // onInput={e => {
                                    //   e.target.value = e.target.value.replace(
                                    //     /[^0A-Za-z]/g,
                                    //     ''
                                    //   );
                                    // }}
                                    inputProps={{
                                      maxLength: 200
                                    }}
                                  />
                                </div>
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <label className={classes.label}>
                                DEFAULT COVERAGE CACR <Required>*</Required>
                                </label>
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <div className={classes.control}>
                                  <Select
                                    classes={classes.dropdown}
                                    value={this.state.dnisCacr}
                                    onChange={event =>
                                      this.handleStateChange(
                                        'dnisCacr',
                                        event.target.value
                                      )}
                                    inputProps={{
                                      name: 'dnisCacr',
                                      id: 'dnisCacr',
                                      placeholder: 'Select One...'
                                    }}
                                  >
                                    {this.props.dropDownList.map(
                                      (obj, index) => {
                                        return (
                                          <MenuItem
                                            key={`dnisCacr_${index}`}
                                            value={obj.fbt_routing_tag}
                                          >
                                            {obj.fbt_notes}
                                          </MenuItem>
                                        );
                                      }
                                    )}
                                  </Select>
                                </div>
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <label className={classes.label}>
                                DEFAULT CALLER TYPE <Required>*</Required>
                                </label>
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <div className={classes.control}>
                                  <Select
                                    classes={classes.dropdown}
                                    value={this.state.defaultCallerType}
                                    onChange={event =>
                                      this.handleStateChange(
                                        'defaultCallerType',
                                        event.target.value
                                      )}
                                    inputProps={{
                                      name: 'defaultCallerType',
                                      id: 'defaultCallerType',
                                      placeholder: 'Select One...'
                                    }}
                                  >
                                    {this.props.dropDownList.map(
                                      (obj, index) => {
                                        return (
                                          <MenuItem
                                            key={`defaultCallerType_${index}`}
                                            value={obj.fbt_routing_tag}
                                          >
                                            {obj.fbt_notes}
                                          </MenuItem>
                                        );
                                      }
                                    )}
                                  </Select>
                                </div>
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <label className={classes.label}>
                                  Notes
                                </label>
                              </Grid>
                              <Grid item xs={12} sm={12}>
                                <div className={classes.control}>
                                  <TextField
                                    id='txtNotes'
                                    name='txtNotes'
                                    placeholder='alphabet_soup'
                                    value={this.state.notes}
                                    onChange={event =>
                                      this.handleStateChange(
                                        'notes',
                                        event.target.value
                                      )}
                                    inputProps={{
                                      maxLength: 2000
                                    }}
                                  />
                                </div>
                              </Grid>
                              {!this.state.isValidForm && <Grid><Required> <RequiredMessage>
                                Please enter the missing fields
                                </RequiredMessage></Required> </Grid>}
                              <Grid item xs={12} sm={12}>
                                <Button
                                  variant='contained'
                                  color='primary'
                                  className={`${classes.button} ${classes.searchBtn}`}
                                  onClick={() => {
                                    this.onSubmitClick();
                                  }}
                                >
                                  Submit
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>
                        </div>
                      </div>
                    </Grid>}
                </Grid>
              </Grid>
            </StyledComponents.RowSC>
          </Fragment>
        </main>
      </MuiThemeProvider>
    );
  }
}

DnisInfo.propTypes = {
  getDnisInfo: PropTypes.func,
  saveDnisInfo: PropTypes.func,
  filterArray: PropTypes.array,
  dropDownList: PropTypes.array,
  data: PropTypes.object,
  rows: PropTypes.array,
  isTableDataLoading: PropTypes.bool,
  classes: PropTypes.object
};

function mapStateToProps (state) {
  return {
    data: state.dnisInfo && state.dnisInfo.dnisInfoList
      ? state.dnisInfo.dnisInfoList
      : null,
    filterArray: state.dnisInfo && state.dnisInfo.filtersList
      ? state.dnisInfo.filtersList.data
      : null,
    dropDownList: state.dnisInfo && state.dnisInfo.dropDownList
      ? state.dnisInfo.dropDownList
      : null,
    isTableDataLoading: state.dnisInfo && state.dnisInfo.isLoading
      ? state.dnisInfo.isLoadingsaveDnisInfsaveDnisInfo
      : false
  };
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ getDnisInfo, saveDnisInfo }, dispatch);
}
DnisInfo = withStyles(styles)(DnisInfo);

export default connect(mapStateToProps, mapDispatchToProps)(DnisInfo);

