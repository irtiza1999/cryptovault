import AlgorithmInsightPanel from "./AlgorithmInsightPanel";

function ResultPanel({ title, data, route, payload }) {
  return (
    <>
      {data ? <AlgorithmInsightPanel title={title} data={data} route={route} payload={payload} /> : null}
    </>
  );
}

export default ResultPanel;
