type Props = {
  message: string;
};

export function LoadingScreen({ message }: Props) {
  return (
    <section className="loading">
      <div className="loading-orb" aria-hidden>
        <span>✨</span>
      </div>
      <p className="loading-text">{message}</p>
    </section>
  );
}
