"""Classify an input CSV into JSON Lines without fetching URLs or dropping rows."""
import argparse
import csv
import json
from pathlib import Path
from pinterest_url_normalizer import parse_pinterest_url

def audit(source, destination, column='url'):
    source, destination = Path(source), Path(destination)
    if source.resolve() == destination.resolve():
        raise ValueError('Output must differ from input')
    records = []
    first_seen = {}
    with source.open(encoding='utf-8-sig', newline='') as stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames or column not in reader.fieldnames:
            raise ValueError(f'Missing column: {column}')
        if len(set(reader.fieldnames)) != len(reader.fieldnames):
            raise ValueError('Duplicate CSV header names')
        for number, row in enumerate(reader, start=1):
            record = {'record_number':number, 'source':row, 'status':'invalid'}
            if None in row or any(value is None for value in row.values()):
                record['error'] = 'Column count does not match header'
            else:
                try:
                    parsed = parse_pinterest_url(row[column].strip())
                    key = parsed.normalized_url
                    record.update(status='classified',kind=parsed.kind,normalized_url=key,
                                  duplicate_of=first_seen.get(key),media_verified=False)
                    first_seen.setdefault(key,number)
                except ValueError as error:
                    record['error'] = str(error)
            records.append(record)
    # Validate all input before creating the output; never replace an existing file.
    with destination.open('x',encoding='utf-8',newline='\n') as output:
        for record in records:
            output.write(json.dumps(record,ensure_ascii=False)+'\n')
    return records

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source'); parser.add_argument('destination')
    parser.add_argument('--column',default='url')
    args=parser.parse_args()
    rows=audit(args.source,args.destination,args.column)
    print(json.dumps({'records':len(rows),'classified':sum(r['status']=='classified' for r in rows)}))
