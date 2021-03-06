import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { FormGroup, ControlLabel, FormControl, Col, Row, Button, Collapse, Overlay, Tooltip } from 'react-bootstrap'
import { MessagePopover } from '../components/'
import { formatLocalCurrency } from '../utils/Utils'

export default class AddMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: false,
      validationError: false,
      validationMsg:{
        startDate:{show:false},
        vestedDate:{show:false}
      }
    };
  }

  toggle = () => {
    this.setState({ form: !this.state.form });
  }

    handleChange = (e) => {
    const target = e.target;
    var value = target.value;
    const name = target.name;

    if (name === "salary") {
      //removing unnecessary characters such as spaces, comma, underscores, dashes, and letters
      value = parseFloat(value.replace(/[^0-9\.]/g, ""));
      this.setState({ [name] : value})
    }

    if (name === "startDate") {
      if(new Date(value) > new Date()) {
        this.setState({
          validationMsg:{
            ...this.state.validationMsg,
            [name]:{target:target, show:true}
          }})
        this.setState({validationError:true})
      } else {
        this.setState({
          validationMsg:{
            ...this.state.validationMsg,
            [name]:{target:target, show:false}
          }})
        this.setState({validationError:false})
      }
    }

    if (name === "vestedDate") {
      if(new Date(value) <= new Date()) {
        this.setState({
          validationMsg:{
            ...this.state.validationMsg,
            [name]:{target:target, show:true}
          }})
        this.setState({validationError:true})
      } else {
        this.setState({
          validationMsg:{
            ...this.state.validationMsg,
            [name]:{target:target, show:false}
          }})
        this.setState({validationError:false})
      }
    }
    const filter = "fixedShare investedCash workedHours";
    if (filter.indexOf(name) >= 0) {
      value = parseFloat(value)
    }
    this.setState({ [name]: value });

  }

  handleSubmit = (e) => {
    e.preventDefault();
    var members = [];
    var totalShareNumbers = 10000; //it should be user(supervisor) input data later.
    let hourlyRate = this.state.salary/52.1429/37.5;
    let nonCash = this.state.workedHours * hourlyRate;
    var share = nonCash + this.state.investedCash*4;
    let days = Math.floor(new Date(new Date() - new Date(this.state.startDate)) / (1000 * 60 * 60 * 24));
    let startDate = new Date(this.state.startDate);
    let efficiency = (this.state.workedHours/(days*(5/7)*7.5)) * 100;
    if(Object.keys(this.props.totals).length === 0) {
      var totalShare = share;
      var totalFixedShare = this.state.fixedShare;
      var variableShare = (share/totalShare*(1-totalFixedShare/100)) * 100;
      var sharePercent = parseFloat(this.state.fixedShare) + variableShare;
      var totalSharePercent = sharePercent;
      var totalInvestedCash = this.state.investedCash;
      var totalNonCash = nonCash;
      var totalSalary = this.state.salary;
      var totalDays = days;
      var totalWorkedHours = this.state.workedHours;
    } else {
      totalShare = this.props.totals.totalShare + share;
      totalFixedShare = this.props.totals.totalFixedShare + this.state.fixedShare;
      totalInvestedCash = this.props.totals.totalInvestedCash + this.state.investedCash;
      totalNonCash = this.props.totals.totalNonCash + nonCash;
      totalSalary = this.props.totals.totalSalary + this.state.salary;
      totalDays = this.props.totals.totalDays + days;
      totalWorkedHours = this.props.totals.totalWorkedHours + this.state.workedHours;

      //recalculate variableShare, sharePercent, shareNumbers for exsiting members
      members = this.props.members.map(function(member){
        var tempObj = member;
         tempObj.variableShare = (member.share/totalShare*(1-totalFixedShare/100)) * 100;
         tempObj.sharePercent = member.fixedShare + member.variableShare;
         tempObj.shareNumbers = (member.variableShare + member.fixedShare)* 0.01 * totalShareNumbers;
        return tempObj;
       });

      totalSharePercent = this.props.members.map(function(member) {
        return member.sharePercent
      }).reduce(function(a, b) {
          return a + b;
      }, 0);

      variableShare = (share/totalShare*(1-totalFixedShare/100)) * 100;
      sharePercent = parseFloat(this.state.fixedShare) + variableShare;
      totalSharePercent += sharePercent;
    }
    var shareNumbers = (variableShare + this.state.fixedShare)* 0.01 * totalShareNumbers;

    var formData = {
      name:this.state.name,
      investedCash:this.state.investedCash,
      fixedShare:this.state.fixedShare,
      startDate:this.state.startDate,
      vestedDate:this.state.vestedDate,
      salary:this.state.salary,
      workedHours:this.state.workedHours,
      hourlyRate:hourlyRate,
      nonCash:nonCash,
      share:share,
      days:days,
      efficiency:efficiency,
      sharePercent:sharePercent,
      shareNumbers:shareNumbers
    };
    members.push(formData);
    var totalData = {
      totalShare:totalShare,
      totalShareNumbers:totalShareNumbers,
      totalSharePercent:totalSharePercent,
      totalFixedShare:totalFixedShare,
      totalInvestedCash:totalInvestedCash,
      totalNonCash:totalNonCash,
      totalDays:totalDays,
      totalWorkedHours:totalWorkedHours,
      totalSalary:totalSalary
    };

    //this.props.onAdd(formData,totalData);
    this.props.onAdd(members,totalData);
  }

  render(){

  const styles = {
    form : {
      padding: '5px'
    },
    row : {
      paddingTop: '5px'
    }
  };

  const ErrMessages = {
    startDate : 'Start Date should be past calendar or today',
    vestedDate : 'Vested Date should be future calendar'
  }

  return(
    <div>
        <Button color="primary" onClick={this.toggle}>Add</Button>
        <Collapse in={this.state.form}>

        <form onSubmit={this.handleSubmit} style={styles.form} >
          <FormGroup
            controlId="addMemberForm" >
            <Row style={styles.row}>
              <Col componentClass={ControlLabel} sm={2} className="text-right">
                Name
              </Col>
              <Col sm={4}>
                <FormControl type="text" name="name" value={this.state.name} placeholder="Enter Name" onChange={this.handleChange} required />
              </Col>
              <Col componentClass={ControlLabel} sm={2} className="text-right">
                Fixed Share(%)
              </Col>
              <Col sm={4}>
                <FormControl type="number" name="fixedShare" step="0.01" min="0" value={this.state.fixedShare} placeholder="Enter Fixed Share(%). ex) 10" onChange={this.handleChange} required />
              </Col>
            </Row>

            <Row style={styles.row}>
              <Col componentClass={ControlLabel} sm={2} className="text-right">
                Start Date
              </Col>
              <Col sm={4}>
                <FormControl type="date" name="startDate" value={this.state.startDate} placeholder="Start Date" onChange={this.handleChange} required />
                  <Overlay
                    show={this.state.validationMsg.startDate.show}
                    target={this.state.validationMsg.startDate.target}
                    placement="bottom"
                    container={this}
                  >
                  <Tooltip>{ErrMessages.startDate}</Tooltip>
                </Overlay>
              </Col>
              <Col componentClass={ControlLabel} sm={2} className="text-right">
                Invested Cash
              </Col>
              <Col sm={4}>
                <FormControl type="number" name="investedCash" step="0.01" min="0" value={this.state.investedCash} placeholder="Enter Invested Cash. ex) 300" onChange={this.handleChange} required />
              </Col>
            </Row>

            <Row style={styles.row}>
              <Col componentClass={ControlLabel} sm={2} className="text-right">
                Vested Date
              </Col>
              <Col sm={4}>
                <FormControl type="date" name="vestedDate" value={this.state.vestedDate} placeholder="Vested Date" onChange={this.handleChange} required />
                  <Overlay
                    show={this.state.validationMsg.vestedDate.show}
                    target={this.state.validationMsg.vestedDate.target}
                    placement="bottom"
                    container={this}
                  >
                  <Tooltip>{ErrMessages.vestedDate}</Tooltip>
                </Overlay>
              </Col>
              <Col componentClass={ControlLabel} sm={2} className="text-right">
                Salary
              </Col>
              <Col sm={4}>
                <FormControl type="text" name="salary"  value={formatLocalCurrency(this.state.salary)} placeholder="Enter Salary. ex) 60000" onChange={this.handleChange} required />
              </Col>
            </Row>

            <Row style={styles.row}>
              <Col componentClass={ControlLabel} sm={2} className="text-right">
                Worked Hours
              </Col>
              <Col sm={2}>
                <FormControl type="number" name="workedHours" step="0.01" min="0" value={this.state.workedHours} placeholder="" onChange={this.handleChange} required />
              </Col>
            </Row>

          </FormGroup>
          <Row>
            <Col smOffset={6}>
              <Button type="submit" disabled={this.state.validationError}>
                Submit
              </Button>
            </Col>
          </Row>
        </form>

        </Collapse>
      </div>
  );
  }
}
