/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React from 'react';
import MessageTable from './table.jsx';
import './app.scss';
import { ChartPie } from "./pieChart.jsx";

const RenderServerErrorMessage = (message) => (
    <div className="alert alert-danger alert-dismissable">
        <button type="button" className="close" data-dismiss="alert" aria-hidden="true">
            <span className="pficon pficon-close" />
        </button>
        <span className="pficon pficon-error-circle-o" />
        <strong>Error: {message}</strong>
    </div>
);

const _ = cockpit.gettext;

const dynmap_url = "DYNMAP_URL";
const papermc_jar_filename = "paperclip.jar";
const papermc_directory = "PAPERMC_DIRECTORY";
const screen_session_name = "CockpitPaperMC";

export class Application extends React.Component {
    constructor() {
        super();

        this.state = {
            'tab': _(0),
            'isRunning': _(false),
            'rawLog': _(""),
            'output': _(""),
            'error': _(""),
            'inputValue': _(""),

            'entities': _(""),
            'players': _(""),
            'plugins': _(""),
        };

        this.retrieveGameInfo();

        this.updateInput = this.updateInput.bind(this);
        this.serverSendInput = this.serverSendInput.bind(this);
        this.inputKeyPressed = this.inputKeyPressed.bind(this);

        this.proc = null;

        this.serverReconnect();
        this.retrieveLogInfo();
    }

    serverStart() {
        this.setState(() => ({ 'output': "" }));

        var options = {
            "directory": papermc_directory,
            "environ": ["TERM=xterm-256color"],
            "pty": true
        };

        this.proc = cockpit.spawn(["screen", "-S", screen_session_name, "java", "-Xms16G", "-Xmx16G", "-XX:+UseG1GC", "-XX:+UnlockExperimentalVMOptions", "-XX:MaxGCPauseMillis=100", "-XX:+DisableExplicitGC", "-XX:TargetSurvivorRatio=90", "-XX:G1NewSizePercent=50", "-XX:G1MaxNewSizePercent=80", "-XX:G1MixedGCLiveThresholdPercent=35", "-XX:+AlwaysPreTouch", "-XX:+ParallelRefProcEnabled", "-Dusing.aikars.flags=mcflags.emc.gs", "-jar", papermc_jar_filename, "nogui"], options);
        this.proc.done(() => this.serverDone());
        this.proc.stream((data) => this.serverOutput(data));
        this.proc.fail((exception) => this.serverFailed(exception));
    }

    serverStop() {
        this.proc.input("stop\n", true);
    }

    serverReconnect() {
        const options = {
            "directory": papermc_directory,
            "environ": ["TERM=xterm-256color"],
            "pty": true
        };

        this.proc = cockpit.spawn(["screen", "-r", screen_session_name], options);
        this.proc.done(() => this.serverDone());
        this.proc.stream((data) => this.serverOutput(data));
        this.proc.fail((exception) => this.setState(() => ({ 'isRunning': false })));

        return this.state.isRunning;
    }

    retrieveLogInfo() {
        cockpit.file(papermc_directory + 'logs/latest.log').watch(content => {
            const splitLog = content.split("\n");

            const loginfo = [];

            splitLog.forEach(element => {
                loginfo.push({
                    important: true,
                    time: "00:00",
                    message: element,
                    service: "Service"
                });
            });

            this.setState({ rawLog: loginfo });
        });
    }

    retrieveGameInfo() {
        cockpit.file(papermc_directory + 'plugins/CockpitPaperMC/entities.json').watch(content => {
            this.setState({ entities: JSON.parse(content) });
        });

        cockpit.file(papermc_directory + 'plugins/CockpitPaperMC/players.json').watch(content => {
            this.setState({ players: JSON.parse(content) });
        });

        cockpit.file(papermc_directory + 'plugins/CockpitPaperMC/plugins.json').watch(content => {
            this.setState({ plugins: JSON.parse(content) });
        });
    }

    serverDone() {
        this.setState(() => ({ 'isRunning': false }));
    }

    serverFailed(exception) {
        this.setState(() => ({ 'error': RenderServerErrorMessage(exception.message) }));
        this.setState(() => ({ 'isRunning': false }));
    }

    serverOutput(data) {
        this.state.isRunning = true;
        var currentOutput = this.state.output;

        this.setState(() => ({ 'output': currentOutput + data }));
    }

    RenderStartStopButton() {
        if (this.state.isRunning)
            return <button className="btn btn-danger float-right" id="stop-server" onClick={() => this.serverStop()}>Stop Server</button>;
        else
            return <button className="btn btn-primary float-right" id="start-server" onClick={() => this.serverStart()}>Start Server</button>;
    }

    serverSendInput() {
        this.proc.input(this.state.inputValue + "\n", true);
        this.setState({ inputValue: "" });
    }

    updateInput(event) {
        this.setState({ inputValue: event.target.value });
    }

    inputKeyPressed(event) {
        console.log(event.key);
        if (event.key === "Enter") {
            this.serverSendInput();
        }
    }

    RenderConsole() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Console</h3>
                </div>
                <div className="panel-body">
                    <pre style={{ height: "256px", overflowX: "hidden" }}>
                        {this.state.output}
                    </pre>
                    <div className="input-group">
                        <input type="text" className="form-control" value={this.state.inputValue} onChange={this.updateInput} disabled={!this.state.isRunning} />
                        <span className="input-group-btn">
                            <button type="button" className="btn btn-default" onClick={() => this.serverSendInput()} onKeyPress={this.inputKeyPressed} disabled={!this.state.isRunning}>Send</button>
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    RenderDashboard() {
        let entityData = [];

        if (this.state.entities.world !== undefined) {
            for (let [key, value] of Object.entries(this.state.entities.world)) {
                entityData.push([key, value]);
            }
        }

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Dashboard</h3>
                </div>
                <div className="panel-body">
                    <ChartPie data={ entityData } />
                </div>
            </div>
        );
    }

    RenderLogs() {
        return (
            <MessageTable messages={this.state.rawLog} />
        );
    }

    RenderPanelBody() {
        switch (this.state.tab) {
        case 0:
            return this.RenderDashboard();
        case 1:
            return this.RenderConsole();
        case 2:
            return this.RenderLogs();
        }
    }

    RenderHeaderButtons() {
        const classNameRegular = "btn btn-default";
        const classNameActive = "btn btn-default active";

        let classNameDashboardButton = classNameRegular;
        let classNameConsoleButton = classNameRegular;
        var classNameLogsButton = classNameRegular;

        switch (this.state.tab) {
        case 0:
            classNameDashboardButton = classNameActive;
            break;
        case 1:
            classNameConsoleButton = classNameActive;
            break;
        case 2:
            classNameLogsButton = classNameActive;
            break;
        }

        return (
            <div className="btn-group pull-left">
                <button type="button" className={classNameDashboardButton} onClick={() => this.setState({ tab: 0 })}>Dashboard</button>
                <button type="button" className={classNameConsoleButton} onClick={() => this.setState({ tab: 1 })}>Console</button>
                <button type="button" className={classNameLogsButton} onClick={() => this.setState({ tab: 2 })}>Logs</button>
                <a type="button" className="btn btn-default" href={dynmap_url} target="_blank">Dynmap</a>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div className="content-header-extra">
                    {this.RenderHeaderButtons()}
                    <div className="pull-right text-right">
                        {this.RenderStartStopButton()}
                    </div>
                </div>
                <div id="journal-box" className="container-fluid">
                    {this.state.error}
                    {this.RenderPanelBody()}
                </div>
            </div>
        );
    }
}
