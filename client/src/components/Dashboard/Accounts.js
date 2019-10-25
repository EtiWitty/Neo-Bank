import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  getTransactions,
  addAccount,
  deleteAccount
} from "../../actions/accountActions";
import { logoutUser } from "../../actions/authActions";
import MaterialTable from "material-table"; // https://mbrn.github.io/material-table/#/

class Accounts extends Component {
  componentDidMount() {




    // const { accounts } = this.props;
    const accounts = [];
  }

// Add account
  handleOnSuccess = (token, metadata) => {
  };

// Logout
  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };
render() {
    const transactionsLoading = false;
    const transactions = [];
    const accounts = [];
    const { user } = this.props.auth;

let accountItems = accounts.map(account => (
      <li key={account._id} style={{ marginTop: "1rem" }}>
        <button
          style={{ marginRight: "1rem" }}
          onClick={this.onDeleteClick.bind(this, account._id)}
          className="btn btn-small btn-floating waves-effect waves-light hoverable red accent-3"
        >
          <i className="material-icons">delete</i>
        </button>
        <b>{account.institutionName}</b>
      </li>
    ));

// Setting up data table
    const transactionsColumns = [
      { title: "Account", field: "account" },
      { title: "Date", field: "date", type: "date", defaultSort: "desc" },
      { title: "Name", field: "name" },
      { title: "Amount", field: "amount" },
      { title: "Category", field: "category" }
    ];
let transactionsData = [];
    transactions.forEach(function(account) {
      account.transactions.forEach(function(transaction) {
        transactionsData.push({
          account: account.accountName,
          date: transaction.date,
          category: transaction.category[0],
          name: transaction.name,
          amount: transaction.amount
        });
      });
    });
return (
      <div className="row">
        <div className="col s12">
          <button
            onClick={this.onLogoutClick}
            className="btn-flat waves-effect"
          >
            <i className="material-icons left">keyboard_backspace</i> Log Out
          </button>
          <h4>
            <b>Welcome!</b>
          </h4>
          <p className="grey-text text-darken-1">
            Hey there, {user.name.split(" ")[0]}
          </p>
          <h5>
            <b>Linked Accounts</b>
          </h5>
          <p className="grey-text text-darken-1">
            Add or remove your bank accounts below
          </p>
          <ul>{accountItems}</ul>
          <hr style={{ marginTop: "2rem", opacity: ".2" }} />
          <h5>
            <b>Transactions</b>
          </h5>
          {transactionsLoading ? (
            <p className="grey-text text-darken-1">Fetching transactions...</p>
          ) : (
            <>
              <p className="grey-text text-darken-1">
                You have <b>{transactionsData.length}</b> transactions from your
                <b> {accounts.length}</b> linked
                {accounts.length > 1 ? (
                  <span> accounts </span>
                ) : (
                  <span> account </span>
                )}
                from the past 30 days
              </p>
              <MaterialTable
                columns={transactionsColumns}
                data={transactionsData}
                title="Search Transactions"
              />
            </>
          )}
        </div>
      </div>
    );
  }
}

Accounts.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
});
  
export default connect(
	mapStateToProps,
)(Accounts);