from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from timeline_generator import load_linked_sources, generate_timeline, visualize_timeline

app = Flask(__name__)
CORS(app)

(card_swipes, cctv, wifi_logs, lab_bookings,
 text_notes, library_checkouts, entity_table) = load_linked_sources()

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.get_json()
    entity_id = data.get('entity_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    event_types = data.get('event_types')

    if not entity_id:
        return jsonify({'error': 'entity_id is required'}), 400

    sd = pd.to_datetime(start_date) if start_date else None
    ed = pd.to_datetime(end_date) if end_date else None

    timeline, event_counts, inactivity_flag, predicted_next, anomalies = generate_timeline(
        entity_id, card_swipes, cctv, wifi_logs, lab_bookings,
        text_notes, library_checkouts, entity_table,
        sd, ed, event_types
    )

    timeline_records = timeline.to_dict(orient='records') if hasattr(timeline, 'to_dict') else timeline

    response = {
        'timeline': timeline_records,
        'event_counts': event_counts,
        'inactivity_flag': bool(inactivity_flag),
        'predicted_next': predicted_next,
        'anomalies': anomalies
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)
