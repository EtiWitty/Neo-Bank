const express = require("express");
const router = express.Router();
const passport = require("passport");
const moment = require("moment");
const mongoose = require("mongoose");
const SynapsePay = require("synapsepay");

// Load Account and User models
const Account = require("../../models/Account");
const User = require("../../models/User");

let SYNAPSE_CLIENT_ID;
let SYNAPSE_SECRET;
let SYNAPSE_USER_FINGERPRINT;
let SYNAPSE_USER_ID;

if (process.env.SYNAPSE_CLIENT_ID) {
	SYNAPSE_CLIENT_ID = process.env.SYNAPSE_CLIENT_ID;
	SYNAPSE_SECRET = process.env.SYNAPSE_SECRET;
	SYNAPSE_USER_FINGERPRINT = process.env.SYNAPSE_USER_FINGERPRINT
	SYNAPSE_USER_ID = process.env.SYNAPSE_USER_ID
} else {
	const secrets = require("./secrets");
	SYNAPSE_CLIENT_ID = secrets.SYNAPSE_CLIENT_ID;
	SYNAPSE_SECRET = secrets.SYNAPSE_SECRET;
	SYNAPSE_USER_FINGERPRINT = secrets.SYNAPSE_USER_FINGERPRINT;
	SYNAPSE_USER_ID = secrets.SYNAPSE_USER_ID;
}

const { Users, Nodes, Clients, Helpers, Transactions } = SynapsePay;

const client = new Clients(
  SYNAPSE_CLIENT_ID,
  SYNAPSE_SECRET,
  // is_production boolean determines sandbox or production endpoints used
  false
);

let users = [];
Users.get(
	client,
	{
		ip_address: Helpers.getUserIP(),
		page: '', //optional
		per_page: '', //optional
		query: '' //optional
	},
	function(err, usersResponse) {
		// error or array of user objects
		users = usersResponse.users;
	}
);

let mainUser = null;
let nodes = [];

Users.get(
	client,
	{
	_id: SYNAPSE_USER_ID,
	fingerprint: SYNAPSE_USER_FINGERPRINT,
	ip_address: Helpers.getUserIP(),
	full_dehydrate: 'yes' //optional
	},
	function(errResp, userResponse) {
		// error or user object
		mainUser = userResponse;
		console.log({mainUser});
		Nodes.get(
			mainUser,
  {
    _id: "5db23b9e8d1b7d23d812b3cf",
    full_dehydrate: 'yes' //optional
  },
			function(err, nodesResponse) {
				// error or array of node objects
				nodes = nodesResponse;
				console.log({nodesResponse});
			}
		);
	}
);




// Routes will go here
// @route POST api/synapse/accounts/add
// @desc Trades CLIENT token for access token and stores credentials in database
// @access Private
router.post(
	"/accounts/add",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  CLIENT_TOKEN = req.body.client_token;
  		const userId = req.user.id;
  		const institution = req.body.metadata.institution;
		const { name, institution_id } = institution;

  if (CLIENT_TOKEN) {
		client
		  .exchangeClientToken(CLIENT_TOKEN)
		  .then(exchangeResponse => {
			ACCESS_TOKEN = exchangeResponse.access_token;
			ITEM_ID = exchangeResponse.item_id;
  // Check if account already exists for specific user
			Account.findOne({
			  userId: req.user.id,
			  institutionId: institution_id
			})
			  .then(account => {
				if (account) {
				  console.log("Account already exists");
				} else {
				  const newAccount = new Account({
					userId: userId,
					accessToken: ACCESS_TOKEN,
					itemId: ITEM_ID,
					institutionId: institution_id,
					institutionName: name
				  });
  newAccount.save().then(account => res.json(account));
				}
			  })
			  .catch(err => console.log(err)); // Mongo Error
		  })
		  .catch(err => console.log(err)); // Synapse Error
	  }
	}
  );

// @route DELETE api/synapse/accounts/:id
// @desc Delete account with given id

router.delete(
	"/accounts/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  Account.findById(req.params.id).then(account => {
		// Delete account
		account.remove().then(() => res.json({ success: true }));
	  });
});

// @route GET api/synapse/accounts
// @desc Get all accounts linked with synapse for a specific user
// @access Private
router.get(
	"/accounts",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.send(users);
	}
  );

  // @route GET api/synapse/accounts
  // @desc Get all accounts linked with synapse for a specific user
  // @access Private
  router.get(
	  "/nodes",
	  passport.authenticate("jwt", { session: false }),
	  (req, res) => {
		res.send(nodes);
	  }
	);

// @route POST api/synapse/accounts/transactions
// @desc Fetch transactions from past 30 days from all linked accounts
// @access Private
router.post(
	"/accounts/transactions",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
	  const now = moment();
	  const today = now.format("YYYY-MM-DD");
	  const thirtyDaysAgo = now.subtract(30, "days").format("YYYY-MM-DD"); // Change this if you want more transactions
  let transactions = [];
  const accounts = req.body;
  if (accounts) {
		accounts.forEach(function(account) {
		  ACCESS_TOKEN = account.accessToken;
		  const institutionName = account.institutionName;
  client
			.getTransactions(ACCESS_TOKEN, thirtyDaysAgo, today)
			.then(response => {
			  transactions.push({
				accountName: institutionName,
				transactions: response.transactions
			  });
  // Don't send back response till all transactions have been added
  if (transactions.length === accounts.length) {
				res.json(transactions);
			  }
			})
			.catch(err => console.log(err));
		});
	  }
	}
  );

module.exports = router;