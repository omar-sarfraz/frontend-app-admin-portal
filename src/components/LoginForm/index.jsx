import React from 'react';
import { Fieldset, InputText, Button } from '@edx/paragon';
import { withRouter } from 'react-router';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import LoadingSpinner from '../LoadingSpinner';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.redirectToReferrer = this.redirectToReferrer.bind(this);
    const { isAuthenticated } = this.props;
    if (isAuthenticated) {
      this.redirectToReferrer();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated && !prevProps.isAuthenticated) {
      this.redirectToReferrer();
    }
  }

  handleEmailChange(email) {
    this.setState({
      email: email.trim(),
    });
  }

  handlePasswordChange(password) {
    this.setState({
      password: password.trim(),
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { email, password } = this.state;
    this.props.login(email, password);
    // clear form
    this.setState({
      email: '',
      password: '',
    });
  }

  redirectToReferrer() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };
    this.props.history.push(from.pathname);
  }

  render() {
    const { loading, error } = this.props;
    return (
      <div className="container">
        <Helmet>
          <title>Login</title>
        </Helmet>
        <div className="row justify-content-center">
          <div className="col-4">
            <form>
              <Fieldset
                legend={<p className="text-secondary">Log in to edX</p>}
                invalidMessage="Invalid username and/or password"
                isValid={error === null}
                variant={{ status: 'DANGER' }}
                variantIconDescription="Error"
              >
                <InputText
                  name="email"
                  value={this.state.email}
                  label="Email"
                  type="text"
                  onChange={this.handleEmailChange}
                />
                <InputText
                  name="password"
                  value={this.state.password}
                  label="Password"
                  type="password"
                  onChange={this.handlePasswordChange}
                />
                <div className="form-addons">
                  <div className="row">
                    <div className="col-3">
                      <Button buttonType="primary" label="Sign In" type="submit" onClick={this.handleSubmit} />
                    </div>
                    <div className="ml-2">
                      <LoadingSpinner loading={loading} />
                    </div>
                  </div>
                </div>
              </Fieldset>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

LoginForm.defaultProps = {
  login: () => {},
  history: {},
  error: null,
  location: {},
};

LoginForm.propTypes = {
  loading: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  error: PropTypes.objectOf(PropTypes.string),
  login: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: PropTypes.string,
      }),
    }),
  }),
};

export default withRouter(LoginForm);
