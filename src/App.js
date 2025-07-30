import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import { useHistory, useLocation } from "react-router-dom";
import "./App.scss";

import AppBar from "@material-ui/core/AppBar";
import Report from "./Console/Report";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from '@material-ui/core/CircularProgress';

import EmbeddedReport from "./Console/EmbeddedReport";
import VisionZero from "./Console/VisionZero";
import _ from "lodash";

const DEFAULT_REPORT_TYPES = ["accidents_around_schools","schools"];

const useStyles = makeStyles((theme) => ({
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: "#f9f9f9",
  },
  bottomBar: {
    top: "auto",
    bottom: 0,
    backgroundColor: "#f9f9f9",
  },
  title: {
    flexGrow: 1,
  },
  hide: {
    display: "none",
  },
  logo: {
    height: "30px",
    marginLeft: "0px",
    marginTop: "10px",
  },
  visionZeroButton: {
    margin: theme.spacing(1),
    marginLeft: "20px",
    fontSize: "1rem",
  },
  visionZeroLink: {
    color: "#FFFFFF",
    textDecoration: "none",
  },
  content: {},
  formControl: {
    margin: theme.spacing(1),
    minWidth: 280,
  },
}));

function getData(url, callback) {
  return () => {
    axios.get(url).then(function (response) {
      callback(response.data);
    });
  };
}

function App() {
  const history = useHistory();
  const location = useLocation();
  const [schoolsMetaData, setSchoolsMetaData] = useState([]);
  const [selectedId, setSelectedId] = React.useState(null);

  const [embeddedReports, setEmbeddedReports] = React.useState([]);
  const [optionItems, setOptionItems] = React.useState(null);

  useEffect(
    getData("https://www.anyway.co.il/api/schools-names", setSchoolsMetaData),
    []
  );

  useEffect(
    getData(`https://www.anyway.co.il/api/embedded-reports`, setEmbeddedReports),
    []
  );

  useEffect(() => {
    if (embeddedReports.length > 0) {
      setOptionItems(
        embeddedReports.map((report) => (
          <MenuItem key={report.id} value={report.report_name_english}>
            {report.report_name_hebrew}
          </MenuItem>
        ))
      );
    }
  }, [embeddedReports]);

  const onOptionChange = (event) => {
    const selectedReport = _.find(embeddedReports, {
      report_name_english: event.target.value,
    });
    if (!selectedReport) {
      history.push('/');
    }else {
      history.push(`/${selectedReport.report_name_english}`);
    }
  };

  const classes = useStyles();

  return (
    <div className="App">
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar variant="dense">
          <a href="https://anyway.co.il">
            <img
              src="images/anyway.png"
              alt="Anyway"
              className={classes.logo}
            />
          </a>
          <a className={classes.visionZeroLink} href="#visionZeroSection">
            <Button variant="outlined" className={classes.visionZeroButton}>
              חזון אפס הרוגים
            </Button>
          </a>
          <div>
            {(schoolsMetaData.length === 0 || embeddedReports.length === 0) && <CircularProgress />}
            {(schoolsMetaData.length > 0 && embeddedReports.length > 0) && <FormControl variant="outlined" className={classes.formControl}>
              <Select
                variant="outlined"
                className="report-select"
                value={
                  (location.pathname === '/' || embeddedReports.length === 0) ?
                    "0"
                    : location.pathname.substr(1)
                }
                onChange={(e) => onOptionChange(e)}
              >
                <MenuItem key="0" value="0">
                  בחרו דו״ח להצגה
                </MenuItem>
                {optionItems}
              </Select>
            </FormControl>}
          </div>
        </Toolbar>
      </AppBar>
      <Switch>
        {embeddedReports.map((report) => (
           <Route key={report.report_name_english} path={`/${report.report_name_english}`}>
           {DEFAULT_REPORT_TYPES.includes(report.report_name_english) ? <Report
                 path={`/${report.report_name_english}`}
                 schools={schoolsMetaData}
                 selectedId={selectedId}
                 setSelectedId={setSelectedId}
               /> : <EmbeddedReport report={report} />}
         </Route>
        ))}
      </Switch>

      <div className="vision-zero-container" id="visionZeroSection">
        <VisionZero />
      </div>
      <AppBar position="fixed" className={classes.bottomBar}>
        <Toolbar variant="dense">
          <div className="anyway-footer">
            <a
              href="http://www.anyway.co.il/"
              title="נתון לשינוי"
            >
              <img
                className="dfc-logo"
                src="images/dfc.png"
                alt="נתון לשינוי"
              />
            </a>
            <a
              className="dfc-links"
              href="https://www.paypal.com/paypalme/dataforchange"
              target="new"
            >
              תרמו לנו
            </a>
            <a
              className="anyway-links"
              href="mailto:feedback@anyway.co.il?subject=ANYWAY%20Feedback"
              target="new"
            >
              צרו קשר
            </a>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default App;
