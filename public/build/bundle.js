
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\DarkModeToggle.svelte generated by Svelte v3.44.3 */

    const file$a = "src\\DarkModeToggle.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$a, 20, 4, 518);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-7 w-7 text-link");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$a, 14, 2, 382);
    			attr_dev(div, "class", "fixed top-5 right-5 cursor-pointer group print:hidden");
    			add_location(div, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DarkModeToggle', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DarkModeToggle> was created with unknown prop '${key}'`);
    	});

    	const click_handler = function () {
    		let htmlClasses = document.querySelector("html").classList;

    		if (localStorage.theme == "dark") {
    			htmlClasses.remove("dark");
    			localStorage.removeItem("theme");
    		} else {
    			htmlClasses.add("dark");
    			localStorage.theme = "dark";
    		}
    	};

    	return [click_handler];
    }

    class DarkModeToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DarkModeToggle",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\Info.svelte generated by Svelte v3.44.3 */

    const file$9 = "src\\Info.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*name*/ ctx[0]}`;
    			t1 = space();
    			p = element("p");
    			p.textContent = `${/*about*/ ctx[1]}`;
    			attr_dev(h1, "class", "text-4xl text-center text-vivid");
    			add_location(h1, file$9, 7, 2, 259);
    			attr_dev(p, "class", "text-vivid leading-tight text-justify");
    			add_location(p, file$9, 8, 2, 318);
    			attr_dev(div, "class", "space-y-5");
    			add_location(div, file$9, 6, 0, 232);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Info', slots, []);
    	let name = "Madhavan Raja";
    	let about = "Hi! I'm a software engineer, full-stack developer, competitive programmer and a research enthusiast. I am interested in Deep Learning and Computer Vision.";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ name, about });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('about' in $$props) $$invalidate(1, about = $$props.about);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, about];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\Publications\PublicationsCard.svelte generated by Svelte v3.44.3 */

    const file$8 = "src\\Publications\\PublicationsCard.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let a;
    	let h3;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let span;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(/*authors*/ ctx[1]);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(/*journal*/ ctx[2]);
    			t5 = space();
    			span = element("span");
    			t6 = text(/*link*/ ctx[3]);
    			attr_dev(h3, "class", "text-item-heading mb-1 text-link print:text-vivid inline-block table");
    			add_location(h3, file$8, 9, 4, 172);
    			attr_dev(p0, "class", "text-sm text-vivid group-hover:text-link inline-block table");
    			add_location(p0, file$8, 14, 4, 297);
    			attr_dev(p1, "class", "text-sm text-muted group-hover:text-link inline-block table");
    			add_location(p1, file$8, 17, 4, 401);
    			attr_dev(span, "class", "text-link hidden print:block");
    			add_location(span, file$8, 20, 4, 505);
    			attr_dev(a, "href", /*link*/ ctx[3]);
    			add_location(a, file$8, 8, 2, 151);
    			attr_dev(div, "class", "group inline-block table");
    			add_location(div, file$8, 7, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    			append_dev(a, p0);
    			append_dev(p0, t2);
    			append_dev(a, t3);
    			append_dev(a, p1);
    			append_dev(p1, t4);
    			append_dev(a, t5);
    			append_dev(a, span);
    			append_dev(span, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (dirty & /*authors*/ 2) set_data_dev(t2, /*authors*/ ctx[1]);
    			if (dirty & /*journal*/ 4) set_data_dev(t4, /*journal*/ ctx[2]);
    			if (dirty & /*link*/ 8) set_data_dev(t6, /*link*/ ctx[3]);

    			if (dirty & /*link*/ 8) {
    				attr_dev(a, "href", /*link*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PublicationsCard', slots, []);
    	let { name } = $$props;
    	let { authors } = $$props;
    	let { journal } = $$props;
    	let { link } = $$props;
    	const writable_props = ['name', 'authors', 'journal', 'link'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PublicationsCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('authors' in $$props) $$invalidate(1, authors = $$props.authors);
    		if ('journal' in $$props) $$invalidate(2, journal = $$props.journal);
    		if ('link' in $$props) $$invalidate(3, link = $$props.link);
    	};

    	$$self.$capture_state = () => ({ name, authors, journal, link });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('authors' in $$props) $$invalidate(1, authors = $$props.authors);
    		if ('journal' in $$props) $$invalidate(2, journal = $$props.journal);
    		if ('link' in $$props) $$invalidate(3, link = $$props.link);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, authors, journal, link];
    }

    class PublicationsCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { name: 0, authors: 1, journal: 2, link: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PublicationsCard",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<PublicationsCard> was created without expected prop 'name'");
    		}

    		if (/*authors*/ ctx[1] === undefined && !('authors' in props)) {
    			console.warn("<PublicationsCard> was created without expected prop 'authors'");
    		}

    		if (/*journal*/ ctx[2] === undefined && !('journal' in props)) {
    			console.warn("<PublicationsCard> was created without expected prop 'journal'");
    		}

    		if (/*link*/ ctx[3] === undefined && !('link' in props)) {
    			console.warn("<PublicationsCard> was created without expected prop 'link'");
    		}
    	}

    	get name() {
    		throw new Error("<PublicationsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<PublicationsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get authors() {
    		throw new Error("<PublicationsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set authors(value) {
    		throw new Error("<PublicationsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get journal() {
    		throw new Error("<PublicationsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set journal(value) {
    		throw new Error("<PublicationsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<PublicationsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<PublicationsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Publications\Publications.svelte generated by Svelte v3.44.3 */
    const file$7 = "src\\Publications\\Publications.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:0) {#if publications.length > 0}
    function create_if_block$3(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let current;
    	let each_value = /*publications*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Publications";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-section-heading");
    			add_location(h2, file$7, 14, 4, 514);
    			attr_dev(div, "class", "item-spacing");
    			add_location(div, file$7, 13, 2, 482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*publications*/ 1) {
    				each_value = /*publications*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(13:0) {#if publications.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#each publications as publication}
    function create_each_block$4(ctx) {
    	let publicationscard;
    	let current;

    	publicationscard = new PublicationsCard({
    			props: {
    				name: /*publication*/ ctx[1].name,
    				authors: /*publication*/ ctx[1].authors,
    				journal: /*publication*/ ctx[1].journal,
    				link: /*publication*/ ctx[1].link
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(publicationscard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(publicationscard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(publicationscard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(publicationscard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(publicationscard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(17:4) {#each publications as publication}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*publications*/ ctx[0].length > 0 && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*publications*/ ctx[0].length > 0) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Publications', slots, []);

    	let publications = [
    		{
    			name: "Violence Detection in CCTV footage using Deep Learning with Optical Flow in inconsistent weather and lighting conditions",
    			authors: "R Madhavan, Utkarsh, JV Vidhya",
    			journal: "Springer (CCIS, volume 1440), 2021",
    			link: "https://link.springer.com/chapter/10.1007/978-3-030-81462-5_56"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Publications> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ PublicationsCard, publications });

    	$$self.$inject_state = $$props => {
    		if ('publications' in $$props) $$invalidate(0, publications = $$props.publications);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [publications];
    }

    class Publications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Publications",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\CompetitiveProgramming\CompetitiveProgrammingCard.svelte generated by Svelte v3.44.3 */

    const file$6 = "src\\CompetitiveProgramming\\CompetitiveProgrammingCard.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let a;
    	let h3;
    	let t0;
    	let t1;
    	let p;
    	let span;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div0;
    	let t9;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(/*platformName*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			span = element("span");
    			t2 = text(/*username*/ ctx[2]);
    			t3 = text(" • ");
    			t4 = text(/*rating*/ ctx[3]);
    			t5 = text(" (");
    			t6 = text(/*ratingDescription*/ ctx[4]);
    			t7 = text(")");
    			t8 = space();
    			div0 = element("div");
    			t9 = text(/*link*/ ctx[1]);
    			attr_dev(h3, "class", "text-item-heading mb-1 text-link print:text-vivid inline-block table");
    			add_location(h3, file$6, 10, 4, 213);
    			attr_dev(span, "class", "font-mono");
    			add_location(span, file$6, 18, 6, 455);
    			attr_dev(p, "class", "text-sm text-muted group-hover:text-link print:text-vivid inline-block table");
    			add_location(p, file$6, 15, 4, 346);
    			attr_dev(div0, "class", "text-sm text-link hidden print:block");
    			add_location(div0, file$6, 20, 4, 550);
    			attr_dev(a, "href", /*link*/ ctx[1]);
    			add_location(a, file$6, 9, 2, 192);
    			attr_dev(div1, "class", "group inline-block table");
    			add_location(div1, file$6, 8, 0, 150);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    			append_dev(a, p);
    			append_dev(p, span);
    			append_dev(span, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(a, t8);
    			append_dev(a, div0);
    			append_dev(div0, t9);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*platformName*/ 1) set_data_dev(t0, /*platformName*/ ctx[0]);
    			if (dirty & /*username*/ 4) set_data_dev(t2, /*username*/ ctx[2]);
    			if (dirty & /*rating*/ 8) set_data_dev(t4, /*rating*/ ctx[3]);
    			if (dirty & /*ratingDescription*/ 16) set_data_dev(t6, /*ratingDescription*/ ctx[4]);
    			if (dirty & /*link*/ 2) set_data_dev(t9, /*link*/ ctx[1]);

    			if (dirty & /*link*/ 2) {
    				attr_dev(a, "href", /*link*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompetitiveProgrammingCard', slots, []);
    	let { platformName } = $$props;
    	let { link } = $$props;
    	let { username } = $$props;
    	let { rating } = $$props;
    	let { ratingDescription } = $$props;
    	const writable_props = ['platformName', 'link', 'username', 'rating', 'ratingDescription'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompetitiveProgrammingCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('platformName' in $$props) $$invalidate(0, platformName = $$props.platformName);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('username' in $$props) $$invalidate(2, username = $$props.username);
    		if ('rating' in $$props) $$invalidate(3, rating = $$props.rating);
    		if ('ratingDescription' in $$props) $$invalidate(4, ratingDescription = $$props.ratingDescription);
    	};

    	$$self.$capture_state = () => ({
    		platformName,
    		link,
    		username,
    		rating,
    		ratingDescription
    	});

    	$$self.$inject_state = $$props => {
    		if ('platformName' in $$props) $$invalidate(0, platformName = $$props.platformName);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('username' in $$props) $$invalidate(2, username = $$props.username);
    		if ('rating' in $$props) $$invalidate(3, rating = $$props.rating);
    		if ('ratingDescription' in $$props) $$invalidate(4, ratingDescription = $$props.ratingDescription);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [platformName, link, username, rating, ratingDescription];
    }

    class CompetitiveProgrammingCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			platformName: 0,
    			link: 1,
    			username: 2,
    			rating: 3,
    			ratingDescription: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompetitiveProgrammingCard",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*platformName*/ ctx[0] === undefined && !('platformName' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'platformName'");
    		}

    		if (/*link*/ ctx[1] === undefined && !('link' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'link'");
    		}

    		if (/*username*/ ctx[2] === undefined && !('username' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'username'");
    		}

    		if (/*rating*/ ctx[3] === undefined && !('rating' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'rating'");
    		}

    		if (/*ratingDescription*/ ctx[4] === undefined && !('ratingDescription' in props)) {
    			console.warn("<CompetitiveProgrammingCard> was created without expected prop 'ratingDescription'");
    		}
    	}

    	get platformName() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set platformName(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get username() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set username(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rating() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rating(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ratingDescription() {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ratingDescription(value) {
    		throw new Error("<CompetitiveProgrammingCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\CompetitiveProgramming\CompetitiveProgramming.svelte generated by Svelte v3.44.3 */
    const file$5 = "src\\CompetitiveProgramming\\CompetitiveProgramming.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (22:0) {#if platforms.length > 0}
    function create_if_block$2(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let current;
    	let each_value = /*platforms*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Competitive Programming";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-section-heading");
    			add_location(h2, file$5, 23, 4, 579);
    			attr_dev(div, "class", "item-spacing");
    			add_location(div, file$5, 22, 2, 547);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*platforms*/ 1) {
    				each_value = /*platforms*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(22:0) {#if platforms.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (26:4) {#each platforms as platform}
    function create_each_block$3(ctx) {
    	let competitiveprogrammingcard;
    	let current;

    	competitiveprogrammingcard = new CompetitiveProgrammingCard({
    			props: {
    				platformName: /*platform*/ ctx[1].name,
    				link: /*platform*/ ctx[1].link,
    				username: /*platform*/ ctx[1].username,
    				rating: /*platform*/ ctx[1].rating,
    				ratingDescription: /*platform*/ ctx[1].ratingDescription
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(competitiveprogrammingcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(competitiveprogrammingcard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(competitiveprogrammingcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(competitiveprogrammingcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(competitiveprogrammingcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(26:4) {#each platforms as platform}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*platforms*/ ctx[0].length > 0 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*platforms*/ ctx[0].length > 0) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CompetitiveProgramming', slots, []);

    	let platforms = [
    		{
    			name: "CodeChef",
    			username: "flipped_flop",
    			link: "https://www.codechef.com/users/flipped_flop",
    			rating: 1862,
    			ratingDescription: "4★"
    		},
    		{
    			name: "Codeforces",
    			username: "madhavan_raja",
    			link: "https://codeforces.com/profile/madhavan_raja",
    			rating: 1586,
    			ratingDescription: "Specialist"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CompetitiveProgramming> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CompetitiveProgrammingCard, platforms });

    	$$self.$inject_state = $$props => {
    		if ('platforms' in $$props) $$invalidate(0, platforms = $$props.platforms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [platforms];
    }

    class CompetitiveProgramming extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompetitiveProgramming",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Projects\ProjectsCard.svelte generated by Svelte v3.44.3 */

    const file$4 = "src\\Projects\\ProjectsCard.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let a;
    	let h3;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let span;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*description*/ ctx[2]);
    			t3 = space();
    			span = element("span");
    			t4 = text(/*link*/ ctx[1]);
    			attr_dev(h3, "class", "text-item-heading mb-1 text-link print:text-vivid inline-block table");
    			add_location(h3, file$4, 8, 4, 153);
    			attr_dev(p, "class", "text-sm text-muted group-hover:text-link inline-block table");
    			add_location(p, file$4, 13, 4, 278);
    			attr_dev(span, "class", "text-sm text-link hidden print:block");
    			add_location(span, file$4, 16, 4, 386);
    			attr_dev(a, "href", /*link*/ ctx[1]);
    			add_location(a, file$4, 7, 2, 132);
    			attr_dev(div, "class", "group inline-block table");
    			add_location(div, file$4, 6, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    			append_dev(a, p);
    			append_dev(p, t2);
    			append_dev(a, t3);
    			append_dev(a, span);
    			append_dev(span, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (dirty & /*description*/ 4) set_data_dev(t2, /*description*/ ctx[2]);
    			if (dirty & /*link*/ 2) set_data_dev(t4, /*link*/ ctx[1]);

    			if (dirty & /*link*/ 2) {
    				attr_dev(a, "href", /*link*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProjectsCard', slots, []);
    	let { name } = $$props;
    	let { link } = $$props;
    	let { description } = $$props;
    	const writable_props = ['name', 'link', 'description'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProjectsCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({ name, link, description });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, link, description];
    }

    class ProjectsCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0, link: 1, description: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectsCard",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<ProjectsCard> was created without expected prop 'name'");
    		}

    		if (/*link*/ ctx[1] === undefined && !('link' in props)) {
    			console.warn("<ProjectsCard> was created without expected prop 'link'");
    		}

    		if (/*description*/ ctx[2] === undefined && !('description' in props)) {
    			console.warn("<ProjectsCard> was created without expected prop 'description'");
    		}
    	}

    	get name() {
    		throw new Error("<ProjectsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ProjectsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ProjectsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ProjectsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<ProjectsCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<ProjectsCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Projects\Projects.svelte generated by Svelte v3.44.3 */
    const file$3 = "src\\Projects\\Projects.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (33:0) {#if projects.length > 0}
    function create_if_block$1(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let current;
    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Projects";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-section-heading");
    			add_location(h2, file$3, 34, 4, 1138);
    			attr_dev(div, "class", "item-spacing");
    			add_location(div, file$3, 33, 2, 1106);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*projects*/ 1) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(33:0) {#if projects.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#each projects as project}
    function create_each_block$2(ctx) {
    	let projectscard;
    	let current;

    	projectscard = new ProjectsCard({
    			props: {
    				name: /*project*/ ctx[1].name,
    				link: /*project*/ ctx[1].link,
    				description: /*project*/ ctx[1].description
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projectscard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectscard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectscard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectscard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectscard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(37:4) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*projects*/ ctx[0].length > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*projects*/ ctx[0].length > 0) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);

    	let projects = [
    		{
    			name: "FurDB",
    			link: "https://github.com/madhavan-raja/furdb",
    			description: "A small and space-efficient Database Management System."
    		},
    		{
    			name: "Misere Tic Tac Toe AI",
    			link: "https://github.com/madhavan-raja/misere-tic-tac-toe-ml",
    			description: "Regression Learning for a variation of a Tic Tac Toe game."
    		},
    		{
    			name: "Ligh",
    			link: "https://github.com/madhavan-raja/ligh",
    			description: "A full-stack blog website written in Flask, Python, SQLAlchemy, HTML (Jinja), and CSS."
    		},
    		{
    			name: "Procedural Music Generator",
    			link: "https://github.com/madhavan-raja/procedural-music-generator",
    			description: "Generates endless music from a given key and scale."
    		},
    		{
    			name: "Reverse Flappy Bird",
    			link: "https://github.com/madhavan-raja/reverse-flappy-bird",
    			description: "A variation of the Flappy Bird game."
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ProjectsCard, projects });

    	$$self.$inject_state = $$props => {
    		if ('projects' in $$props) $$invalidate(0, projects = $$props.projects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [projects];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Contacts\ContactCard.svelte generated by Svelte v3.44.3 */

    const file$2 = "src\\Contacts\\ContactCard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (15:4) {#each paths as path}
    function create_each_block$1(ctx) {
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[3]);
    			add_location(path, file$2, 15, 6, 333);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*paths*/ 4 && path_d_value !== (path_d_value = /*path*/ ctx[3])) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(15:4) {#each paths as path}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let a;
    	let svg;
    	let title;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let t2;
    	let t3;
    	let span;
    	let t4;
    	let each_value = /*paths*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t0 = text(/*name*/ ctx[0]);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t2 = text(/*name*/ ctx[0]);
    			t3 = text(": ");
    			span = element("span");
    			t4 = text(/*link*/ ctx[1]);
    			add_location(title, file$2, 13, 4, 277);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-7 w-7 text-vivid hover:text-link");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$2, 7, 2, 124);
    			attr_dev(a, "class", "print:hidden");
    			attr_dev(a, "href", /*link*/ ctx[1]);
    			add_location(a, file$2, 6, 0, 84);
    			attr_dev(span, "class", "text-link");
    			add_location(span, file$2, 21, 34, 451);
    			attr_dev(div0, "class", "text-vivid");
    			add_location(div0, file$2, 21, 2, 419);
    			attr_dev(div1, "class", "hidden print:block");
    			add_location(div1, file$2, 20, 0, 383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, title);
    			append_dev(title, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, span);
    			append_dev(span, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*paths*/ 4) {
    				each_value = /*paths*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*link*/ 2) {
    				attr_dev(a, "href", /*link*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);
    			if (dirty & /*link*/ 2) set_data_dev(t4, /*link*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContactCard', slots, []);
    	let { name } = $$props;
    	let { link } = $$props;
    	let { paths } = $$props;
    	const writable_props = ['name', 'link', 'paths'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContactCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('paths' in $$props) $$invalidate(2, paths = $$props.paths);
    	};

    	$$self.$capture_state = () => ({ name, link, paths });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('link' in $$props) $$invalidate(1, link = $$props.link);
    		if ('paths' in $$props) $$invalidate(2, paths = $$props.paths);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, link, paths];
    }

    class ContactCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0, link: 1, paths: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactCard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<ContactCard> was created without expected prop 'name'");
    		}

    		if (/*link*/ ctx[1] === undefined && !('link' in props)) {
    			console.warn("<ContactCard> was created without expected prop 'link'");
    		}

    		if (/*paths*/ ctx[2] === undefined && !('paths' in props)) {
    			console.warn("<ContactCard> was created without expected prop 'paths'");
    		}
    	}

    	get name() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get paths() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set paths(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Contacts\Contacts.svelte generated by Svelte v3.44.3 */
    const file$1 = "src\\Contacts\\Contacts.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (38:0) {#if officialContacts.length > 0 || unofficialContacts.length > 0}
    function create_if_block(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let t2;
    	let span;
    	let t4;
    	let current;
    	let each_value_1 = /*officialContacts*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*unofficialContacts*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Contacts";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			span = element("span");
    			span.textContent = "•";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-section-heading hidden print:block");
    			add_location(h2, file$1, 39, 4, 2669);
    			attr_dev(span, "class", "text-vivid cursor-default print:hidden");
    			add_location(span, file$1, 51, 6, 3062);
    			attr_dev(div0, "class", "flex flex-row print:flex-col justify-center print:justify-left space-x-4 print:space-x-0 space-y-0");
    			add_location(div0, file$1, 40, 4, 2740);
    			attr_dev(div1, "class", "item-spacing");
    			add_location(div1, file$1, 38, 2, 2637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t2);
    			append_dev(div0, span);
    			append_dev(div0, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*officialContacts*/ 1) {
    				each_value_1 = /*officialContacts*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*unofficialContacts*/ 2) {
    				each_value = /*unofficialContacts*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(38:0) {#if officialContacts.length > 0 || unofficialContacts.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (44:6) {#each officialContacts as contact}
    function create_each_block_1(ctx) {
    	let contactcard;
    	let current;

    	contactcard = new ContactCard({
    			props: {
    				name: /*contact*/ ctx[2].name,
    				link: /*contact*/ ctx[2].link,
    				paths: /*contact*/ ctx[2].paths
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contactcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contactcard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contactcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(44:6) {#each officialContacts as contact}",
    		ctx
    	});

    	return block;
    }

    // (54:6) {#each unofficialContacts as contact}
    function create_each_block(ctx) {
    	let contactcard;
    	let current;

    	contactcard = new ContactCard({
    			props: {
    				name: /*contact*/ ctx[2].name,
    				link: /*contact*/ ctx[2].link,
    				paths: /*contact*/ ctx[2].paths
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contactcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contactcard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contactcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:6) {#each unofficialContacts as contact}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*officialContacts*/ ctx[0].length > 0 || /*unofficialContacts*/ ctx[1].length > 0) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*officialContacts*/ ctx[0].length > 0 || /*unofficialContacts*/ ctx[1].length > 0) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contacts', slots, []);

    	let officialContacts = [
    		{
    			name: "Email",
    			link: "mailto:madhavanraja99@gmail.com",
    			paths: [
    				"M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
    			]
    		},
    		{
    			name: "LinkedIn",
    			link: "https://www.linkedin.com/in/madhavan-raja/",
    			paths: [
    				"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
    			]
    		},
    		{
    			name: "GitHub",
    			link: "https://github.com/madhavan-raja",
    			paths: [
    				"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
    			]
    		}
    	];

    	let unofficialContacts = [
    		{
    			name: "Cute Fluffy Kitten",
    			link: "https://linktr.ee/cutefluffykitten",
    			paths: [
    				"M7.953 15.066c-.08.163-.08.324-.08.486.08.517.528.897 1.052.89h1.294v4.776c0 .486-.404.89-.89.89H6.577a.898.898 0 0 1-.889-.891v-4.774H.992c-.728 0-1.214-.729-.89-1.377l6.96-12.627a1.065 1.065 0 0 1 1.863 0l2.913 5.585-3.885 7.042zm15.945 0l-6.96-12.627a1.065 1.065 0 0 0-1.862 0l-2.995 5.586 3.885 7.04c.081.164.081.326.081.487-.08.517-.529.897-1.052.89h-1.296v4.776c.005.49.4.887.89.89h2.914a.9.9 0 0 0 .892-.89v-4.775h4.612c.73 0 1.214-.729.89-1.377Z"
    			]
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contacts> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ContactCard,
    		officialContacts,
    		unofficialContacts
    	});

    	$$self.$inject_state = $$props => {
    		if ('officialContacts' in $$props) $$invalidate(0, officialContacts = $$props.officialContacts);
    		if ('unofficialContacts' in $$props) $$invalidate(1, unofficialContacts = $$props.unofficialContacts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [officialContacts, unofficialContacts];
    }

    class Contacts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contacts",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.3 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let darkmodetoggle;
    	let t0;
    	let div0;
    	let info;
    	let t1;
    	let publications;
    	let t2;
    	let competitiveprogramming;
    	let t3;
    	let projects;
    	let t4;
    	let contacts;
    	let current;
    	darkmodetoggle = new DarkModeToggle({ $$inline: true });
    	info = new Info({ $$inline: true });
    	publications = new Publications({ $$inline: true });
    	competitiveprogramming = new CompetitiveProgramming({ $$inline: true });
    	projects = new Projects({ $$inline: true });
    	contacts = new Contacts({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			create_component(darkmodetoggle.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(info.$$.fragment);
    			t1 = space();
    			create_component(publications.$$.fragment);
    			t2 = space();
    			create_component(competitiveprogramming.$$.fragment);
    			t3 = space();
    			create_component(projects.$$.fragment);
    			t4 = space();
    			create_component(contacts.$$.fragment);
    			attr_dev(div0, "class", "py-10 flex flex-col space-y-12");
    			add_location(div0, file, 26, 4, 847);
    			attr_dev(div1, "class", "px-8 sm:px-20 md:px-40 lg:px-80");
    			add_location(div1, file, 24, 2, 772);
    			add_location(main, file, 23, 0, 762);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			mount_component(darkmodetoggle, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(info, div0, null);
    			append_dev(div0, t1);
    			mount_component(publications, div0, null);
    			append_dev(div0, t2);
    			mount_component(competitiveprogramming, div0, null);
    			append_dev(div0, t3);
    			mount_component(projects, div0, null);
    			append_dev(div0, t4);
    			mount_component(contacts, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(darkmodetoggle.$$.fragment, local);
    			transition_in(info.$$.fragment, local);
    			transition_in(publications.$$.fragment, local);
    			transition_in(competitiveprogramming.$$.fragment, local);
    			transition_in(projects.$$.fragment, local);
    			transition_in(contacts.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(darkmodetoggle.$$.fragment, local);
    			transition_out(info.$$.fragment, local);
    			transition_out(publications.$$.fragment, local);
    			transition_out(competitiveprogramming.$$.fragment, local);
    			transition_out(projects.$$.fragment, local);
    			transition_out(contacts.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(darkmodetoggle);
    			destroy_component(info);
    			destroy_component(publications);
    			destroy_component(competitiveprogramming);
    			destroy_component(projects);
    			destroy_component(contacts);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let htmlClasses = document.querySelector("html").classList;

    	if (localStorage.theme === "dark" || !("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    		htmlClasses.add("dark");
    		localStorage.theme = "dark";
    	} else {
    		htmlClasses.remove("dark");
    		localStorage.removeItem("theme");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		DarkModeToggle,
    		Info,
    		Publications,
    		CompetitiveProgramming,
    		Projects,
    		Contacts,
    		htmlClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ('htmlClasses' in $$props) htmlClasses = $$props.htmlClasses;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
