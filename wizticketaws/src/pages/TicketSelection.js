import React from "react";

/** Element UI Elements */
import { Card, Loading, Icon, Transfer, Layout } from 'element-react'
import { Link } from 'react-router-dom'

/** GraphQL Operation */
import { API, graphqlOperation } from 'aws-amplify'
import { getWizEvent } from '../graphql/queries'

/** S3 Money Things */
import { S3Image } from 'aws-amplify-react'
import BuyTickets from "../components/BuyTickets";

class TicketSelection extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: true,
			event: '',
			selectedTicket: [],
			data: [],
			totalPrice: 0,
			seats: []
		};

		this._filterMethod = this.filterMethod.bind(this)
		this._handleChange = this.handleChange.bind(this)
	}

	componentDidMount = async () => {
		await this.handleGetEventData()
		// this.handleConvertTicket()
	}

	filterMethod = (query, item) => {
		return item.category.toLowerCase().indexOf(query.toLowerCase()) > -1
	}

	handleChange = (value) => {
		let totalPrice = 0
		let seats = []
		value.map(ticket => (
			//eslint-disable-next-line
			totalPrice += this.state.data.filter(t => t.key === ticket)[0].value,
			seats.push(this.state.data.filter(t => t.key === ticket)[0])
		))
		console.log(seats)
		this.setState({ selectedTicket: value, totalPrice, seats })
	}

	handleGetEventData = async () => {
		const input = {
			id: this.props.eventId
		}

		const result = await API.graphql(graphqlOperation(getWizEvent, input))
		var data = []
		for (var i = 0; i < result.data.getWizEvent.tickets.items.length; i++) {
			if (result.data.getWizEvent.tickets.items[i].owner === undefined) {
				var ticket = {
					label: result.data.getWizEvent.tickets.items[i].category + "-" + result.data.getWizEvent.tickets.items[i].seat,
					key: result.data.getWizEvent.tickets.items[i].id,
					category: result.data.getWizEvent.tickets.items[i].category,
					seating: result.data.getWizEvent.tickets.items[i].seat,
					value: result.data.getWizEvent.tickets.items[i].value
				}
				data.push(ticket)
			}
		}
		this.setState({ data: data, event: result.data.getWizEvent, isLoading: false })
	}
	render() {
		const { event, isLoading, selectedTicket } = this.state

		return isLoading ? (<Loading fullscreen={true} />) : (
			<>
				{/** Back Button */}
				<Link className="link" to={`/place/${event.place.id}`}>
					Back to Place List
        	</Link>
				<Card
					className="box-card"
					bodyStyle={{ minWidth: "200px", alignContent: "center" }}
					header={
						<div className="clearfix">
							<span style={{ "lineHeight": "12px" }}> <h1>Select your tickets</h1></span>
						</div>
					}>
					<S3Image
						imgKey={event.pictures.key}
						theme={{
							photoImg: { maxWidth: "100%", maxHeight: "100%" }
						}}
					/>
					<h1 className="mb-mr pt-2">{event.name}</h1>
					<h2 className="mb-mr">{event.description}</h2>
					<Icon name="date" className="date" />{event.validUntil}
					<div>
						<span className="pt-1">By: {event.owner}</span>
					</div>
					<Layout.Row style={{ marginTop: "1%" }}>
						<Layout.Col span="16">
							<Transfer
								filterable
								filterMethod={this._filterMethod}
								filterPlaceholder="Categorias"
								value={selectedTicket}
								onChange={this._handleChange}
								data={this.state.data}
								titles={['Disponibles', 'Seleccionados']}

								footerFormat={{
									//eslint-disable-next-line
									noChecked: '${total}',
									//eslint-disable-next-line
									hasChecked: '${checked}/${total}'
								}}>

							</Transfer>
						</Layout.Col>
						<Layout.Col span="8">
							<Card style={{ marginTop: "1%" }}>
								<Layout.Row>
									<Layout.Col span="24">
										{selectedTicket.length === 0 ? (
											<h3>No Tickets Selected</h3>
										) : (<>
											<h3>{selectedTicket.length} x Tickets Selected</h3>

											<div>
												{this.state.seats.map(seats => (
													<>
														<Card style={{marginTop: "1%", marginBottom: "1%"}}>
															<h2>{seats.category}</h2>
															<span>Seat: {seats.seating}</span>
															<p>Price: ${seats.value} MXN</p>
														</Card>
													</>
												))}
											</div>

											<div>
												Final: <b>${this.state.totalPrice} MXN</b>
											</div>

											<div>
												<BuyTickets />
											</div>
										</>)}
									</Layout.Col>
								</Layout.Row>
							</Card>
						</Layout.Col>
					</Layout.Row>
				</Card>
			</>
		)
	}
}

export default TicketSelection;