import React from "react";
import Comment from "./Comment"
import axios from 'axios'
import moment from 'moment'
import socketIOClient from 'socket.io-client';


class TripComments extends React.Component {
    state = {
        commentsArray: [],
        endpoint: "http://localhost:4001", // this is where we are connecting to the sockets,
   
    }
    componentDidMount () {
        this.loadElements()
    }
    loadElements = () => {
        console.log("working?")
        axios.get('tripcomments/' + localStorage.getItem('tripId'))
        .then(r => {
           // console.log("hello?")
           // console.log(r.data)
            var commentsArray = []
            let i
            for (i=0; i< r.data.length; i++){
                commentsArray.unshift(r.data[i])
            }
            this.setState({commentsArray: commentsArray})
           // console.log(this.state.commentsArray)

        })
        .catch(e => {
            console.log(e)
        })
    } 
    handleInputChange = event => {
        // Destructure the name and value properties off of event.target
        // Update the appropriate state
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    };
    handleAdd = () => {
       // console.log(this.state.comment)
        var userid = localStorage.getItem("userId")
        var tripid = localStorage.getItem("tripId")
        var timestamp = moment().format("LLLL")
        axios.get("/pinboards/indivboard/" + tripid)
        .then(r => {
            var admin = r.data[0].admin
            console.log(admin)
            axios.post('/tripcomments', {
                userid: userid,
                admin: admin,
                tripid: tripid,
                timestamp: timestamp,
                comment: this.state.comment
            })
            .then(r => {
                console.log(r)
                this.refs.comment.value=""
                const socket = socketIOClient(this.state.endpoint)
                socket.emit('update tripcomment', tripid)
                this.loadElements()
            })
        .catch(e => {
            console.log(e)
        })
    })
    .catch(e => {
        console.log(e)
    })


    }
    render() {
    const socket = socketIOClient(this.state.endpoint)
    socket.on('update tripcomment', (page) => {
        if (page === localStorage.getItem("tripId")) {
        this.loadElements()
        }
    })
        return (
            <div>
                <h5>Comments</h5>
                <form>
                    <div className="row">
                        <div className="input-field">
                            <textarea placeholder="Type your shared comment here" id="trip_comment" name="comment" ref="comment" className="materialize-textarea" onChange={this.handleInputChange.bind(this)}></textarea>
                        </div>
                    </div>
                    <div className="row">
                        <a className="waves-effect waves-light btn-small blue darken-4" onClick={this.handleAdd}>ADD</a>
                    </div>
                </form>
                {this.state.commentsArray.map(comment => {
                        return (<Comment 
                            key = {comment._id}
                            id = {comment._id}
                            user = {comment.userid}
                            admin = {comment.admin}
                            comment = {comment.comment}
                            timestamp = {comment.timestamp}
                            empty = ""
                            refresh = {this.loadElements}
                        />)
                    })}
            </div>
        )
    }

}

export default TripComments;
