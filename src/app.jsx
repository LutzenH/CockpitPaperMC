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
import './app.scss';

const RenderServerErrorMessage = (message) => (
    <div className="alert alert-danger alert-dismissable">
        <button type="button" className="close" data-dismiss="alert" aria-hidden="true">
            <span className="pficon pficon-close" />
        </button>
        <span className="pficon pficon-error-circle-o" />
        <strong>Error: { message }</strong>
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
            'isRunning': _(false),
            'output': _(""),
            'error':  _(""),
            'inputValue': _("")
        };

        this.updateInput = this.updateInput.bind(this);
        this.serverSendInput = this.serverSendInput.bind(this);
        this.inputKeyPressed = this.inputKeyPressed.bind(this);

        this.proc = null;

        this.serverReconnect();
    }

    serverStart() {
        this.setState(() => ({ 'output': "" }));

        var options = {
            "directory": papermc_directory,
            "environ": [ "TERM=xterm-256color" ],
            "pty": true
        };

        this.proc = cockpit.spawn(["screen", "-S", screen_session_name, "java", "-server", "-jar", papermc_jar_filename, "nogui"], options);
        this.proc.done(() => this.serverDone());
        this.proc.stream((data) => this.serverOutput(data));
        this.proc.fail((exception) => this.serverFailed(exception));
    }

    serverStop() {
        this.proc.input("stop\n", true);
    }

    serverReconnect() {
        var options = {
            "directory": papermc_directory,
            "environ": [ "TERM=xterm-256color" ],
            "pty": true
        };

        this.proc = cockpit.spawn(["screen", "-r", screen_session_name], options);
        this.proc.done(() => this.serverDone());
        this.proc.stream((data) => this.serverOutput(data));
        this.proc.fail((exception) => this.setState(() => ({ 'isRunning': false })));

        if (this.state.isRunning)
            return true;
        else
            return false;
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
            return <button className="btn btn-danger float-right" id="stop-server" onClick={() => this.serverStop() }>Stop Server</button>;
        else
            return <button className="btn btn-primary float-right" id="start-server" onClick={() => this.serverStart() }>Start Server</button>;
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

    render() {
        return (
            <div className="panel panel-default">
                <div className="container-fluid panel-heading">
                    <div className="btn-group pull-left">
                        <button type="button" className="btn btn-default">Dashboard</button>
                        <button type="button" className="btn btn-default">Console</button>
                        <a type="button" className="btn btn-default" href={dynmap_url} target="_blank">Dynmap</a>
                    </div>
                    <div className="pull-right text-right">
                        { this.RenderStartStopButton() }
                    </div>
                </div>
                <div className="panel-body">
                    { this.state.error }
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <h3 className="panel-title">Console</h3>
                        </div>
                        <div className="panel-body">
                            <pre style={{ height: "256px", overflowX: "hidden" }}>
                                { this.state.output }
                            </pre>
                            <div className="input-group">
                                <input type="text" className="form-control" value={this.state.inputValue} onChange={this.updateInput} disabled={!this.state.isRunning} />
                                <span className="input-group-btn">
                                    <button type="button" className="btn btn-default" onClick={() => this.serverSendInput() } onKeyPress={this.inputKeyPressed} disabled={!this.state.isRunning}>Send</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
