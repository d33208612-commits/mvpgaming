export default function Loader({ full }) {
  return (
    <div className={full ? 'loader-full' : 'loader'}>
      <div className="spinner" />
    </div>
  );
}
