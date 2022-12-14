import { useState } from 'react';
import DeckOfCardsAPI from '../services/deckofcardsapi';
import GameContext from './GameContext';

const GameProvider = ({ children }) => {
	const [idGame, setIdGame] = useState(null);
	var [count, setCount] = useState(0);
	const [win, setWin] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [winName, setWinName] = useState('');
	const [cartaRaspar, setRaspar] = useState({ //propiedades de la carta raspar, Nombre y cartas
		raspar: [],
	});
	//
	const [playerOne, setPlayerOne] = useState({ //propiedades del jugador uno, Nombre y cartas
		name: '',
		cards: [],
		turno: true
	});
	var [playerTwo, setPlayerTwo] = useState({//propiedades del jugador dos, Nombre y cartas
		name: '',
		cards: [],
		turno: false
	});

	const playGame = async () => {
		setIdGame(await DeckOfCardsAPI.getIdGame());
	};

	const llenarCartas = async () => {
		//cartas iniciales jugador uno
		var cards = await DeckOfCardsAPI.getCards(idGame, "10");
		playerOne.cards = cards;

		setPlayerOne(playerOne);
		console.log("se llenó las cartas de el jugador 1")

		//cartas iniciales jugador 2
		cards = await DeckOfCardsAPI.getCards(idGame, "10");

		playerTwo.cards = cards;
		setPlayerTwo(playerTwo);
		console.log("se llenó las cartas de el jugador 2");
		//se setea el contador para que no vuelva a activar esta opcion
		ordenarCartas();
		count = 1;
		setCount(count);
	}
	const cargarRaspar = async () => {
		var cards = await DeckOfCardsAPI.getCards(idGame, "1");
		if (cards == null) {
			alert("el juego terminó")
			window.location = "https://juegodecartaseric.netlify.app/"//papayaso, modificar
			return;
		}
		setRaspar({ ...cartaRaspar, raspar: [cartaRaspar.raspar, cards[0]] });
		if (playerOne.turno) {
			setPlayerOne({ ...playerOne, turno: false });
			setPlayerTwo({ ...playerTwo, turno: true });
			mostrarTurno(playerTwo.name);
		} else {
			setPlayerOne({ ...playerOne, turno: true });
			setPlayerTwo({ ...playerTwo, turno: false });
			mostrarTurno(playerOne.name);
		}
		comprobarGanador();
	}
	const mostrarTurno = (Nombre) => {
		setWin(true);
		setShowToast(true);
		setWinName("turno de jugador: " + Nombre);
		/*setTimeout(() => {
			setWin(false);
			setShowToast(false);
		}, 5000);*/
	}

	const requestCards = async () => {
		if (count == 0) {//verifica el contador, si es 0 es porque acabó de iniciar la partida
			await llenarCartas();
			var cards = await DeckOfCardsAPI.getCards(idGame, "1");//obtiene dos cartas
			if (cards == null) {
				alert("el juego terminó")
				window.location = "https://juegodecartaseric.netlify.app/"//papayaso, modificar
				return;
			}
			//le mete la carta a raspar 
			setRaspar({ ...cartaRaspar, raspar: [cartaRaspar.raspar, cards[0]] });
			mostrarTurno(playerOne.name);
		}
	};
	const BuscarYReemplazarP1 = async (codigoCarta) => {
		if (playerOne.turno) {
			var cards = await DeckOfCardsAPI.getCards(idGame, "1");//traemos la nueva para raspar
			if (cards == null) {
				alert("el juego terminó");
				window.location = "https://juegodecartaseric.netlify.app/"//papayaso, modificar
				return;
			}
			const resultado = playerOne.cards.findIndex(elemento => elemento.code === codigoCarta); //encontramos el index		
			const newCards = [...playerOne.cards]; //creamos una copia del arreglo de las cartas
			newCards[resultado] = cartaRaspar.raspar[1];//guardamos el nuevo objeto en la posicion encontrada
			//guardamos las nuevas cartas en el objetoplayer
			setPlayerOne({ ...playerOne, cards: newCards, turno: false });//actualizamos todos los atributos
			setRaspar({ ...cartaRaspar, raspar: [cartaRaspar.raspar, cards[0]] });//REVISAR
			setPlayerTwo({ ...playerTwo, turno: true });//actualizamos el siguiente turno
			mostrarTurno(playerTwo.name);
		} else {
			mostrarTurno(playerTwo.name);
		}
		comprobarGanador();
	}
	const BuscarYReemplazarP2 = async (codigoCarta) => {
		if (playerTwo.turno) {
			var cards = await DeckOfCardsAPI.getCards(idGame, "1");//traemos la nueva para raspar
			if (cards == null) {
				alert("el juego terminó")
				window.location = "https://juegodecartaseric.netlify.app/"//papayaso, modificar
				return;
			}
			const resultado = playerTwo.cards.findIndex(elemento => elemento.code === codigoCarta); //encontramos el index
			const newCards = [...playerTwo.cards]; //creamos una copia del arreglo de las cartas
			newCards[resultado] = cartaRaspar.raspar[1];//guardamos el nuevo objeto en la posicion encontrada
			//guardamos las nuevas cartas en el objetoplayer
			setPlayerTwo({ ...playerTwo, cards: newCards, turno: false });//actualizamos todos los atributos
			setRaspar({ ...cartaRaspar, raspar: [cartaRaspar.raspar, cards[0]] })//REVISAR
			setPlayerOne({ ...playerOne, turno: true });//actualizamos el siguiente turno
			mostrarTurno(playerOne.name);
		} else {
			mostrarTurno(playerOne.name);
		}
		comprobarGanador();
	}
	const ordenarCartas = () => {
		var aux = playerOne.cards;
		Ordenar(aux);
		setPlayerOne({ ...playerOne, cards: aux });
		aux = playerTwo.cards;
		Ordenar(aux);
		setPlayerTwo({ ...playerTwo, cards: aux });
	}
	//para evitar redundancia en el codigo
	function Ordenar(aux) {
		aux.sort((a, b) => {
			// Compara los valores de las cartas
			// y devuelve -1 si el valor de "a" es menor que el valor de "b",
			// 1 si el valor de "a" es mayor que el valor de "b",
			// y 0 si ambos valor son iguales.
			if (a.value < b.value) {
				return -1;
			} else if (a.value > b.value) {
				return 1;
			} else {
				return 0;
			}
		});
	}
	function comprobarGanador() {
		var player1 = playerOne.cards;
		var player2 = playerTwo.cards;
		var player1Wins = [false, false, false];//posicion 0,1 son ternas, posicion 2 es la cuarta
		var player2Wins = [false, false, false];//posicion 0,1 son ternas, posicion 2 es la cuarta
		Ordenar(player1);
		Ordenar(player2);
		console.log("verificando ternas y cuartas del jugador 1");
		for (let i = 0; i < player1.length; i++) {
			//verificamos que no se pase del limite del arreglo porque el numero maximo es 10, y los condicionales 
			//llegan hasta la posicion actual +3, entonces 7+3=10, como limite
			if (i < 8) {
				//si el valor de la posicion actual, la siguiente de la actual y la siguiente de la siguiente
				// son iguales entonces hay una terna
				//si               7 == 7                                7           ==      7
				if (player1[i].value == player1[i + 1].value && player1[i + 1].value == player1[i + 2].value) {
					//para una cuarta i debe ser menor que 7, 6+4=10
					if (i < 7) {
						//verificamos si hay una cuarta
						if (player1[i + 2].value == player1[i + 3].value) {
							player1Wins[2] = true;//guardamos
							i += 3;
							console.log("jugador 1 tiene una cuarta en la posicion ", i);
							continue;
						}
					}
					//si la primera posicion ya es true entonces guardame el registro en la 2
					if (player1Wins[0]) {
						player1Wins[1] = true;
					} else {//si no, en la primera
						player1Wins[0] = true;
					}
					console.log("jugador 1 tiene una terna en la posicion ", i);
					i += 2;
				}
			}
		}
		if (player1Wins[0] && player1Wins[1] && player1Wins[2]) {
			alert("Felicitaciones " + playerOne.name + ", ganaste!");
			window.location = "https://juegodecartaseric.netlify.app/"//papayaso, modificar
			return;
		}
		//verificando ternas y cuartas del jugador 2
		console.log("verificando ternas y cuartas del jugador 2");
		for (let i = 0; i < player2.length; i++) {
			//verificamos que no se pase del limite del arreglo porque el numero maximo es 10, y los condicionales 
			//llegan hasta la posicion actual +3, entonces 7+3=10, como limite
			if (i < 8) {
				//si el valor de la posicion actual, la siguiente de la actual y la siguiente de la siguiente
				// son iguales entonces hay una terna
				if (player2[i].value == player2[i + 1].value && player2[i + 1].value == player2[i + 2].value) {
					//para una cuarta i debe ser menor que 7, 6+4=10
					if (i < 7) {
						//verificamos si hay una cuarta
						if (player2[i + 2].value == player2[i + 3].value) {
							player2Wins[2] = true;//guardamos
							i += 3;
							console.log("jugador 2 tiene una cuarta");
							continue;
						}
					}
					//si la primera posicion ya es true entonces guardame el registro en la 2
					if (player2Wins[0]) {
						player2Wins[1] = true;
					} else {//si no, en la primera
						player2Wins[0] = true;
					}
					console.log("jugador 2 tiene una terna en la posicion ", i);
					i += 2;
				}
			}
		}
		if (player2Wins[0] && player2Wins[1] && player2Wins[2]) {
			alert("Felicitaciones " + playerTwo.name + ", ganaste!");
			window.location = "https://juegodecartaseric.netlify.app/"//papayaso, modificar
			return;
		}
	}
	return (
		<GameContext.Provider
			value={{
				playGame,
				requestCards,
				playerOne,
				setPlayerOne,
				playerTwo,
				cartaRaspar,
				setRaspar,
				setPlayerTwo,
				showToast,
				setShowToast,
				winName,
				llenarCartas,
				cargarRaspar,
				BuscarYReemplazarP1,
				BuscarYReemplazarP2,
				ordenarCartas,
				mostrarTurno,
				comprobarGanador
			}}
		>
			{children}
		</GameContext.Provider>
	);
};

export default GameProvider;
