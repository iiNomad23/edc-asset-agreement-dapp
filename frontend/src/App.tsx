import { ConnectButton } from '@rainbow-me/rainbowkit';

function App() {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: 12,
            }}
        >
            <ConnectButton
                accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                }}
                showBalance={{
                    smallScreen: false,
                    largeScreen: true,
                }}
            />
        </div>
    );
}

export default App;
