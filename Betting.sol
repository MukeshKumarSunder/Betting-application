// This is the finalized contract to merge with the front end

pragma solidity ^0.4.8;

contract BetFemod {
	
	struct BetDetails {
		address bettorA; 	address bettorB;
		string NameA;		string NameB;
		string StockNameA; 	string StockNameB;
		uint StartTime; 	uint EndTime;
		address winner; 	string winningStock;
		uint amount; 		string winnerName;
		bool betcompleted;	bool winnerPaid;
		//bool draw;	
	}

	mapping(bytes32 => BetDetails) Bet;
	//uint8 ID = 1;
	address ContractOwner;
	uint TotalAmountInContract;

	event ContractDeployed();
	event BetInitiated(address BetInitiator, string IChoose, uint Betamount);
	event BetJoined(address IJoined, string IChoose, uint amount);
	//event itsADraw();
	event YouWon(address Winner,  string YourStock);
	event MoneyTransferred(uint TransferAmount);
	event WonAmount(uint Winnings);
	event YourID(bytes32 ID);
	event TotalAmountInBet(bytes32 ID, uint Amount);
	event TotalContractAmount(uint Amount);
	event ContractKilled();
	event BetCompleted();
	event TimeStator(uint now, uint StartTime, uint EndTime);
	event NoOneWon();
	event BettorAddresses(address bettorA, address bettorB);
	event BettorNames( string NameA, string NameB);
	event BettorStocks(string StockNameA, string StockNameB);
	event BetTime(uint StartTime, uint EndTime);
	event BetResult(address winner, string winningStock, uint amount, string winnerName);
	event BetMiscDetails(bool betcompleted,	bool winnerPaid);
	
	function BetFemod() {
		ContractDeployed();
		ContractOwner = msg.sender;
	}

	function NewBet(string _NameA, string _StockName, uint _startTimeinUnix, uint _endTimeinUnix, bytes32 _ID) payable
	{
		bytes32 id = _ID;
		Bet[id].bettorA = msg.sender;
		Bet[id].amount = (msg.value * 1 ether);
		TotalAmountInContract += (msg.value * 1 ether);
		Bet[id].StockNameA = _StockName;
		Bet[id].NameA = _NameA;

		//Bet[id].draw = false;
		Bet[id].betcompleted = false;

	//	Bet[id].InitialValueA = 100;
	//	Bet[id].FinalValueA = 101;
		
		//uint _startTimeinUnix = 5;
		//uint _endTimeinUnix = 6;

		Bet[id].StartTime = _startTimeinUnix;
		Bet[id].EndTime = _endTimeinUnix;

		TimeStator(now, Bet[id].StartTime, Bet[id].EndTime);

		BetInitiated(Bet[id].bettorA, Bet[id].StockNameA, (msg.value * 1 ether));
		YourID(id);
		TotalAmountInBet(id, Bet[id].amount);
		//ID++;		
	}

	function JoinBet(bytes32 _ID, string _NameB, string _StockName) payable // beforeStartTime(_ID)
	{	
		bytes32 id = _ID;
		TimeStator(now, Bet[id].StartTime, Bet[id].EndTime);
		
		Bet[id].bettorB = msg.sender;
		Bet[id].NameB = _NameB;
		Bet[id].amount = Bet[id].amount + (msg.value * 1 ether);
		
		TotalAmountInContract += msg.value * 1 ether;
		Bet[id].StockNameB = _StockName;
	
		//Bet[id].InitialValueB = 50;
		//Bet[id].FinalValueB = 54;
	
		BetJoined(Bet[id].bettorB, Bet[id].StockNameB, (msg.value* 1 ether));
		TotalAmountInBet(id, Bet[id].amount);
				
	}
	
	function strCompare(string _a, string _b) returns (bool) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        uint len = a.length;
        uint8 flag = 0;

        if(len != b.length)
        	return false;

        for (uint8 i = 0; i < len; i++)
        {
            if (a[i] == b[i])
                flag = 1;
            else 
                return false;
        }

        if(flag ==1)
        	return true;
        else
        	return false;
    } 

	function PayWinner(bytes32 _ID, string _winningStock) //afterEndTime(_ID)
	{
		//Call webservice in real program
		bytes32 id = _ID;
		uint Amount;
	//	int ded = 93/100;
		
		Amount = Bet[id].amount;


		Bet[id].winningStock = _winningStock;

		//bool comresA = strCompare(Bet[id].winningStock,Bet[id].StockNameA);
		//bool comresB = strCompare(Bet[id].winningStock,Bet[id].StockNameB);

		if(strCompare(Bet[id].winningStock,Bet[id].StockNameA))
		{
			Bet[id].winnerName = Bet[id].NameA;
			Bet[id].winner = Bet[id].bettorA;
			if(Bet[id].bettorA.send(Amount))
				YouWon(Bet[id].bettorA, Bet[id].winningStock);
			WonAmount(Amount);
			MoneyTransferred(Amount);
			BetCompleted();
			Bet[id].betcompleted = true;
		}
		else if(strCompare(Bet[id].winningStock,Bet[id].StockNameB))
		{
			Bet[id].winnerName = Bet[id].NameB;
			Bet[id].winner = Bet[id].bettorB;
			if(Bet[id].bettorB.send(Amount))
				YouWon(Bet[id].bettorB, Bet[id].winningStock);
			WonAmount(Amount);
			MoneyTransferred(Amount);
			BetCompleted();
			Bet[id].betcompleted = true;
		}
		else
			NoOneWon();
				/*
				if(Bet[id].draw == true)	// If its a draw
				{
					if(!Bet[id].bettorA.send(Amount/2))
						throw;
					if(!Bet[id].bettorB.send(Amount/2))
						throw;
					itsADraw();
					MoneyTransferred(Amount/2);
				}
				*/

	}// PayWinner function

// Kill the bet and refund the money
// This is just for testing purpose

	function displayBet(bytes32 _ID)
	{
		bytes32 id = _ID;
		BettorAddresses(Bet[id].bettorA,Bet[id].bettorB);
		BettorNames(Bet[id].NameA,		Bet[id].NameB);
		BettorStocks(Bet[id].StockNameA, Bet[id].StockNameB);
		BetTime(Bet[id].StartTime, 	Bet[id].EndTime);
		BetResult(Bet[id].winner,Bet[id].winningStock,Bet[id].amount,Bet[id].winnerName);
		BetMiscDetails(Bet[id].betcompleted, Bet[id].winnerPaid);
	}

	function killContract() external {

    	if(msg.sender != ContractOwner)
        	return;
    	
    	TotalContractAmount(TotalAmountInContract);
    	if(!ContractOwner.send(TotalAmountInContract))
    		throw;
    	//if(!Bet[id].bettorB.send(Amount))
    	//	throw;
    	suicide(msg.sender);
    	ContractKilled();
	} // killContract function
}// Contract end
