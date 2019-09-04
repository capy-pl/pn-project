import React, { PureComponent } from 'react';
import { Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { Container, Dimmer, Loader } from 'semantic-ui-react';

import Navbar from 'Component/menu/Navbar';
import { Switch } from 'Component/route';
import { Auth } from '../../PnApp';
import { updateCurrentUser } from '../../PnApp/Helper';
import Analysis from '../Analysis';
import NotFound from '../NotFound';
import Report, { ReportList } from '../Report';
import Setting from '../Setting';
import Upload from '../Upload';

interface HomeState {
  loading: boolean;
}

class Home extends PureComponent<RouteComponentProps, HomeState> {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  public async componentDidMount() {
    const isValid = await Auth.validate();
    if (isValid) {
      await updateCurrentUser();
      this.setState({ loading: false });
    } else {
      this.props.history.push('/account/login');
    }
  }

  public render() {
    if (this.state.loading) {
      return (
        <div>
          <Container>
            <Dimmer active>
              <Loader size='huge'>Loading...</Loader>
            </Dimmer>
          </Container>
        </div>
      );
    }

    return (
      <div>
        <Navbar />
        <Switch>
          <Route path='/report' component={Report} />
          <Route path='/settings' component={Setting} />
          <Route path='/analysis' component={Analysis} />
          <Route path='/upload' component={Upload} />
          <Route exact path='/' component={ReportList} />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

const HomeComponent = withRouter(Home);
export default HomeComponent;
