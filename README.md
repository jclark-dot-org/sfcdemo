## README

This project is a demo of an issue with @Saleforce/core's `Org.create()`.  To test, you must have the Salesforce CLI installed, and multiple orgs authenticated.  Then, run:

```shell
node index.js [userIdOrAlias] 2>error.log
```

Where `<userIdOrAlias>` is username or alias already authenticated with the Salesforce CLI.  The script will get an instance of `StateAggregator`, use it to enumerate orgs and update their auth info, and extract the auth info (as an 'Organization' object) for the specified org.  Then, it will call `stateAggregator.orgs.read()` with the username from the returned object, pass that to `Org.create()`, get a connection from the new `Org` instance, output the `username` and `instanceUrl` from the connection, and finally try to run a simple Account query.

In most cases, the `username` and `instanceUrl` will be incorrect, and the query will not run (and no error will be logged).  Should you get the correct username, try with a different username or alias.

Once you observe the error, open the generated `error.log` file.  In the error log you will see a logged copy of the AuthInfo, Org, and Connection objects.  Upon close inspection, you will see that the AuthInfo is correct (but has no alias), the Org object is correct, except that it has the wrong alias, and the Connection object will represent the org from Org's (incorrect) alias property, not the original org.  And the query step always fails silently, which may or may not be a side effect of the `Org.create()` issue.  