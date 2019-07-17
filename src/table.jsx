import React from 'react';
import './app.scss';

class MessageRow extends React.Component {
    render() {
        const message = this.props.message;
        const warning = message.important ? <i className="fa fa-exclamation-triangle" /> : "";

        return (
            <div className="cockpit-logline" role="row">
                <div className="cockpit-log-warning" role="cell">
                    {warning}
                </div>
                <div className="cockpit-log-time" role="cell">{message.time}</div>
                <span className="cockpit-log-message" role="cell">{message.message}</span>
                <div className="cockpit-log-service" role="cell">{message.service}</div>
            </div>
        );
    }
}

class MessageTable extends React.Component {
    render() {
        return (
            <div className="panel panel-default cockpit-log-panel" role="table">
                <div className="panel-heading">Server Log</div>
                <div className="panel-body" role="rowgroup">
                    {this.props.messages.map((message, index) => (<MessageRow key={index} message={message} />))}
                </div>
            </div>
        );
    }
}

export default MessageTable;
