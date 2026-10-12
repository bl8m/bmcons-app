import { useEffect, useMemo, useRef, useState } from 'react';

// Tendina con completamento automatico per filtrare un elenco per cliente
// (Mutui, Affidamenti, ...): è un componente controllato sullo stesso
// customerId usato dal filtro via query string, così risulta integrata con
// il filtro già attivato dai link nella scheda cliente (es. StatTile
// "Mutui"/"Affidamenti") — selezionare un cliente da qui o arrivare da quel
// link producono esattamente lo stesso stato.
export default function CustomerAutocomplete({
  customers,
  value,
  onChange,
  placeholder = 'Cerca cliente...',
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedCustomer = customers.find((c) => c._id === value) ?? null;

  // Sincronizza il testo mostrato quando il valore cambia dall'esterno (link
  // dalla scheda cliente, o elenco clienti caricato dopo il primo render).
  useEffect(() => {
    setQuery(selectedCustomer ? selectedCustomer.companyName : '');
  }, [selectedCustomer?._id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery(selectedCustomer ? selectedCustomer.companyName : '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCustomer]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery || normalizedQuery === selectedCustomer?.companyName.toLowerCase()) {
      return customers;
    }
    return customers.filter((c) => c.companyName.toLowerCase().includes(normalizedQuery));
  }, [customers, query, selectedCustomer]);

  const handleSelect = (customer) => {
    onChange(customer?._id);
    setQuery(customer ? customer.companyName : '');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <input
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') event.currentTarget.blur();
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm text-text-dark
          placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => handleSelect(null)}
          aria-label="Rimuovi filtro cliente"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark"
        >
          ×
        </button>
      )}
      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white text-sm shadow-lg">
          {filteredCustomers.length === 0 && (
            <li className="px-3 py-2 text-text-light">Nessun cliente trovato.</li>
          )}
          {filteredCustomers.map((customer) => (
            <li
              key={customer._id}
              onMouseDown={() => handleSelect(customer)}
              className="cursor-pointer px-3 py-2 hover:bg-primary-50"
            >
              {customer.companyName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
