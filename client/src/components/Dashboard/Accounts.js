import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import MaterialTable from "material-table"; // https://mbrn.github.io/material-table/#/
import { logoutUser } from "../../actions/authActions";

class Accounts extends Component {
  componentDidMount() {

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
    const { user } = this.props.auth;
    const { accounts } = this.props;
    console.log({accounts});


// Setting up data table
    const accountsColumns = [
      { title: "Name", field: "name"},
      { title: "Email", field: "email" },
      { title: "ID", field: "id" },
      { title: "DOCS", field: "docs" },
      { title: "PERMISSION", field: "permission" },
      { title: "DOC PERMISSION", field: "doc_permission" },
      { title: "CREATED", field: "created" },
      { title: "LAST UPDATE", field: "last_updated" },
    ];
    let accountsData = [];
      accounts.forEach(function(account) {
        console.log({account});
        const getDateString = (timestamp) => {
          return (new Date(timestamp)+"").split(" GMT")[0];
        }
        const getDocs = (document) => {
          const getDocsFromType = (docs) => {
            docs = docs || [];
            return docs.map(doc => doc.document_type).join(",");
          }

          return [
            getDocsFromType(document.physical_docs),
            getDocsFromType(document.social_docs),
            getDocsFromType(document.veritual_docs)
          ].join(" | ");
        }

        accountsData.push({
          name: account.legal_names.join(""),
          email: account.logins[0].email,
          id: account._id,
          docs: getDocs(account.documents[0]),
          permission: account.permission,
          doc_permission: account.documents[0].permission_scope,
          created: getDateString(account.extra.date_joined),
          last_updated: getDateString(account.extra.last_updated),
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
            <b>Available Accounts</b>
          </h5>
          <p className="grey-text text-darken-1">
            Below are the accounts created in Synapse:
          </p>
          <MaterialTable
              columns={accountsColumns}
              data={accountsData}
              title="Accounts"
              options={{
                headerStyle: {
                  backgroundColor: '#01579b',
                  color: '#FFF'
                }
              }}
            />
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
  { logoutUser }
)(Accounts);